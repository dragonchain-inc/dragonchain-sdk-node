/**
 * Copyright 2019 Dragonchain, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { expect } from 'chai';
import * as ConfigClient from './ConfigCient';

describe('ConfigClient', () => {
  describe('#getConfigFilePath', () => {
    it('returns correct path on windows', () => {
      const platform = () => 'win32';
      process.env.LOCALAPPDATA = 'test';
      expect(ConfigClient.getConfigFilePath({ platform })).to.equal('test/dragonchain/credentials');
    });

    it('returns correct path on non-windows', () => {
      const platform = () => 'something_else';
      const homedir = () => '/home';
      expect(ConfigClient.getConfigFilePath({ platform, homedir })).to.equal('/home/.dragonchain/credentials');
    });
  });

  describe('#getIdFromEnvVars', () => {
    it('returns the DRAGONCHAIN_ID env var if present', () => {
      process.env.DRAGONCHAIN_ID = 'test';
      expect(ConfigClient.getIdFromEnvVars()).to.equal('test');
    });

    it('returns an empty string if the DRAGONCHAIN_ID env var is not present', () => {
      delete process.env.DRAGONCHAIN_ID;
      expect(ConfigClient.getIdFromEnvVars()).to.equal('');
    });
  });

  describe('#getEndpointFromEnvVars', () => {
    it('returns the DRAGONCHAIN_ENDPOINT env var if present', () => {
      process.env.DRAGONCHAIN_ENDPOINT = 'test';
      expect(ConfigClient.getEndpointFromEnvVars()).to.equal('test');
    });

    it('returns an empty string if the DRAGONCHAIN_ENDPOINT env var is not present', () => {
      delete process.env.DRAGONCHAIN_ENDPOINT;
      expect(ConfigClient.getEndpointFromEnvVars()).to.equal('');
    });
  });

  describe('#getCredsFromEnvVars', () => {
    it('returns the credentials if AUTH_KEY and AUTH_KEY_ID env vars are present', () => {
      process.env.AUTH_KEY = 'testKey';
      process.env.AUTH_KEY_ID = 'testId';
      expect(ConfigClient.getCredsFromEnvVars()).to.deep.equal({ authKey: 'testKey', authKeyId: 'testId' });
    });

    it('returns false if AUTH_KEY and AUTH_KEY_ID env vars are not present', () => {
      delete process.env.AUTH_KEY;
      expect(ConfigClient.getCredsFromEnvVars()).to.equal(false);
    });
  });

  describe('#getIdFromFile', () => {
    it('returns dragonchain id from correct section if present', async () => {
      const fakeFile = () => '[default]\ndragonchain_id = test';
      expect(await ConfigClient.getIdFromFile({ readFileAsync: fakeFile })).to.equal('test');
    });

    it('returns an empty string on file open error', async () => {
      const fakeFile = () => {
        throw new Error();
      };
      expect(await ConfigClient.getIdFromFile({ readFileAsync: fakeFile })).to.equal('');
    });

    it('returns an empty string if the correct ini section does not exist', async () => {
      const fakeFile = () => '[notDefault]\nsomething = test';
      expect(await ConfigClient.getIdFromFile({ readFileAsync: fakeFile })).to.equal('');
    });
  });

  describe('#getEndpointFromFile', () => {
    it('returns endpoint from correct section if present', async () => {
      const fakeFile = () => '[id]\nendpoint = test';
      expect(await ConfigClient.getEndpointFromFile('id', { readFileAsync: fakeFile })).to.equal('test');
    });

    it('returns an empty string on file open error', async () => {
      const fakeFile = () => {
        throw new Error();
      };
      expect(await ConfigClient.getEndpointFromFile('id', { readFileAsync: fakeFile })).to.equal('');
    });

    it('returns an empty string if the correct ini section does not exist', async () => {
      const fakeFile = () => '[something]\nsomething = test';
      expect(await ConfigClient.getEndpointFromFile('id', { readFileAsync: fakeFile })).to.equal('');
    });
  });

  describe('#getCredsFromFile', () => {
    it('returns credentials from correct section if present', async () => {
      const fakeFile = () => '[id]\nauth_key = key\nauth_key_id = key_id';
      expect(await ConfigClient.getCredsFromFile('id', { readFileAsync: fakeFile })).to.deep.equal({ authKey: 'key', authKeyId: 'key_id' });
    });

    it('returns false on file open error', async () => {
      const fakeFile = () => {
        throw new Error();
      };
      expect(await ConfigClient.getCredsFromFile('id', { readFileAsync: fakeFile })).to.equal(false);
    });

    it('returns false if the correct ini section does not exist', async () => {
      const fakeFile = () => '[something]\nsomething = test';
      expect(await ConfigClient.getCredsFromFile('id', { readFileAsync: fakeFile })).to.equal(false);
    });
  });

  describe('#getEndpointFromRemote', () => {
    it('returns endpoint from remote service', async () => {
      const fakeFetch = () => {
        return {
          json: () => {
            return { url: 'test' };
          }
        };
      };
      expect(await ConfigClient.getEndpointFromRemote('id', { fetch: fakeFetch })).to.equal('test');
    });

    it('throws NOT_FOUND when unexpected response schema from remote', async () => {
      const fakeFetch = () => {
        return {
          json: () => {
            return { notUrl: 'test' };
          }
        };
      };
      try {
        await ConfigClient.getEndpointFromRemote('id', { fetch: fakeFetch });
      } catch (e) {
        expect(e.code).to.equal('NOT_FOUND');
        return;
      }
      expect.fail();
    });

    it('throws NOT_FOUND when erroring while fetching from remote', async () => {
      const fakeFetch = () => {
        throw new Error();
      };
      try {
        await ConfigClient.getEndpointFromRemote('id', { fetch: fakeFetch });
      } catch (e) {
        expect(e.code).to.equal('NOT_FOUND');
        return;
      }
      expect.fail();
    });
  });

  describe('#getCredsAsSmartContract', () => {
    it('returns false when credentials arent found in files', async () => {
      const fakeFile = () => {
        throw new Error();
      };
      expect(await ConfigClient.getCredsAsSmartContract({ readFileAsync: fakeFile })).to.equal(false);
    });

    it('returns values from files as credentials', async () => {
      const fakeFile = () => 'thing';
      expect(await ConfigClient.getCredsAsSmartContract({ readFileAsync: fakeFile })).to.deep.equal({ authKey: 'thing', authKeyId: 'thing' });
    });
  });

  describe('#getDragonchainId', () => {
    it('returns ID from env vars', async () => {
      const getIdFromEnvVars = () => 'envId';
      const getIdFromFile = () => 'fileId';
      expect(await ConfigClient.getDragonchainId({ getIdFromEnvVars, getIdFromFile })).to.equal('envId');
    });

    it('returns ID from config file', async () => {
      const getIdFromEnvVars = () => '';
      const getIdFromFile = () => 'fileId';
      expect(await ConfigClient.getDragonchainId({ getIdFromEnvVars, getIdFromFile })).to.equal('fileId');
    });

    it('throws NOT_FOUND when not found', async () => {
      const getIdFromEnvVars = () => '';
      const getIdFromFile = () => '';
      try {
        await ConfigClient.getDragonchainId({ getIdFromEnvVars, getIdFromFile });
      } catch (e) {
        expect(e.code).to.equal('NOT_FOUND');
        return;
      }
      expect.fail();
    });
  });

  describe('#getDragonchainEndpoint', () => {
    it('returns Endpoint from env vars', async () => {
      const getEndpointFromEnvVars = () => 'envEndpoint';
      expect(await ConfigClient.getDragonchainEndpoint('id', { getEndpointFromEnvVars })).to.equal('envEndpoint');
    });

    it('returns Endpoint from config file', async () => {
      const getEndpointFromEnvVars = () => '';
      const getEndpointFromFile = () => 'fileEndpoint';
      expect(await ConfigClient.getDragonchainEndpoint('id', { getEndpointFromEnvVars, getEndpointFromFile })).to.equal('fileEndpoint');
    });

    it('returns Endpoint from remote', async () => {
      const getEndpointFromEnvVars = () => '';
      const getEndpointFromFile = () => '';
      const getEndpointFromRemote = () => 'remoteEndpoint';
      expect(await ConfigClient.getDragonchainEndpoint('id', { getEndpointFromEnvVars, getEndpointFromFile, getEndpointFromRemote })).to.equal('remoteEndpoint');
    });

    it('throws Error from getEndpointFromRemote', async () => {
      const error = new Error('thing');
      const getEndpointFromEnvVars = () => '';
      const getEndpointFromFile = () => '';
      const getEndpointFromRemote = () => {
        throw error;
      };
      try {
        await ConfigClient.getDragonchainEndpoint('id', { getEndpointFromEnvVars, getEndpointFromFile, getEndpointFromRemote });
      } catch (e) {
        expect(e).to.equal(error);
        return;
      }
      expect.fail();
    });
  });

  describe('#getDragonchainCredentials', () => {
    it('returns credentials from env vars', async () => {
      const creds = { authKey: 'thing', authKeyId: 'keyid' };
      const getCredsFromEnvVars = () => creds;
      expect(await ConfigClient.getDragonchainCredentials('id', { getCredsFromEnvVars })).to.equal(creds);
    });

    it('returns credentials from config file', async () => {
      const creds = { authKey: 'thing', authKeyId: 'keyid' };
      const getCredsFromEnvVars = () => false;
      const getCredsFromFile = () => creds;
      expect(await ConfigClient.getDragonchainCredentials('id', { getCredsFromEnvVars, getCredsFromFile })).to.equal(creds);
    });

    it('returns credentials from smart contract location', async () => {
      const creds = { authKey: 'thing', authKeyId: 'keyid' };
      const getCredsFromEnvVars = () => false;
      const getCredsFromFile = () => false;
      const getCredsAsSmartContract = () => creds;
      expect(await ConfigClient.getDragonchainCredentials('id', { getCredsFromEnvVars, getCredsFromFile, getCredsAsSmartContract })).to.equal(creds);
    });

    it('throws NOT_FOUND when not found', async () => {
      const getCredsFromEnvVars = () => false;
      const getCredsFromFile = () => false;
      const getCredsAsSmartContract = () => false;
      try {
        await ConfigClient.getDragonchainCredentials('id', { getCredsFromEnvVars, getCredsFromFile, getCredsAsSmartContract });
      } catch (e) {
        expect(e.code).to.equal('NOT_FOUND');
        return;
      }
      expect.fail();
    });
  });
});
