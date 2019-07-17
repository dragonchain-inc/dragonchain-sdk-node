"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const chai_1 = require("chai");
const ConfigClient = require("./ConfigCient");
describe('ConfigClient', () => {
    describe('#getConfigFilePath', () => {
        it('returns correct path on windows', () => {
            const platform = () => 'win32';
            process.env.LOCALAPPDATA = 'test';
            chai_1.expect(ConfigClient.getConfigFilePath({ platform })).to.equal('test/dragonchain/credentials');
        });
        it('returns correct path on non-windows', () => {
            const platform = () => 'something_else';
            const homedir = () => '/home';
            chai_1.expect(ConfigClient.getConfigFilePath({ platform, homedir })).to.equal('/home/.dragonchain/credentials');
        });
    });
    describe('#getIdFromEnvVars', () => {
        it('returns the DRAGONCHAIN_ID env var if present', () => {
            process.env.DRAGONCHAIN_ID = 'test';
            chai_1.expect(ConfigClient.getIdFromEnvVars()).to.equal('test');
        });
        it('returns an empty string if the DRAGONCHAIN_ID env var is not present', () => {
            delete process.env.DRAGONCHAIN_ID;
            chai_1.expect(ConfigClient.getIdFromEnvVars()).to.equal('');
        });
    });
    describe('#getEndpointFromEnvVars', () => {
        it('returns the DRAGONCHAIN_ENDPOINT env var if present', () => {
            process.env.DRAGONCHAIN_ENDPOINT = 'test';
            chai_1.expect(ConfigClient.getEndpointFromEnvVars()).to.equal('test');
        });
        it('returns an empty string if the DRAGONCHAIN_ENDPOINT env var is not present', () => {
            delete process.env.DRAGONCHAIN_ENDPOINT;
            chai_1.expect(ConfigClient.getEndpointFromEnvVars()).to.equal('');
        });
    });
    describe('#getCredsFromEnvVars', () => {
        it('returns the credentials if AUTH_KEY and AUTH_KEY_ID env vars are present', () => {
            process.env.AUTH_KEY = 'testKey';
            process.env.AUTH_KEY_ID = 'testId';
            chai_1.expect(ConfigClient.getCredsFromEnvVars()).to.deep.equal({ authKey: 'testKey', authKeyId: 'testId' });
        });
        it('returns false if AUTH_KEY and AUTH_KEY_ID env vars are not present', () => {
            delete process.env.AUTH_KEY;
            chai_1.expect(ConfigClient.getCredsFromEnvVars()).to.equal(false);
        });
    });
    describe('#getIdFromFile', () => {
        it('returns dragonchain id from correct section if present', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => '[default]\ndragonchain_id = test';
            chai_1.expect(yield ConfigClient.getIdFromFile({ readFileAsync: fakeFile })).to.equal('test');
        }));
        it('returns an empty string on file open error', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => { throw new Error(); };
            chai_1.expect(yield ConfigClient.getIdFromFile({ readFileAsync: fakeFile })).to.equal('');
        }));
        it('returns an empty string if the correct ini section does not exist', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => '[notDefault]\nsomething = test';
            chai_1.expect(yield ConfigClient.getIdFromFile({ readFileAsync: fakeFile })).to.equal('');
        }));
    });
    describe('#getEndpointFromFile', () => {
        it('returns endpoint from correct section if present', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => '[id]\nendpoint = test';
            chai_1.expect(yield ConfigClient.getEndpointFromFile('id', { readFileAsync: fakeFile })).to.equal('test');
        }));
        it('returns an empty string on file open error', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => { throw new Error(); };
            chai_1.expect(yield ConfigClient.getEndpointFromFile('id', { readFileAsync: fakeFile })).to.equal('');
        }));
        it('returns an empty string if the correct ini section does not exist', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => '[something]\nsomething = test';
            chai_1.expect(yield ConfigClient.getEndpointFromFile('id', { readFileAsync: fakeFile })).to.equal('');
        }));
    });
    describe('#getCredsFromFile', () => {
        it('returns credentials from correct section if present', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => '[id]\nauth_key = key\nauth_key_id = key_id';
            chai_1.expect(yield ConfigClient.getCredsFromFile('id', { readFileAsync: fakeFile })).to.deep.equal({ authKey: 'key', authKeyId: 'key_id' });
        }));
        it('returns false on file open error', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => { throw new Error(); };
            chai_1.expect(yield ConfigClient.getCredsFromFile('id', { readFileAsync: fakeFile })).to.equal(false);
        }));
        it('returns false if the correct ini section does not exist', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => '[something]\nsomething = test';
            chai_1.expect(yield ConfigClient.getCredsFromFile('id', { readFileAsync: fakeFile })).to.equal(false);
        }));
    });
    describe('#getEndpointFromRemote', () => {
        it('returns endpoint from remote service', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFetch = () => { return { json: () => { return { url: 'test' }; } }; };
            chai_1.expect(yield ConfigClient.getEndpointFromRemote('id', { fetch: fakeFetch })).to.equal('test');
        }));
        it('throws NOT_FOUND when unexpected response schema from remote', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFetch = () => { return { json: () => { return { notUrl: 'test' }; } }; };
            try {
                yield ConfigClient.getEndpointFromRemote('id', { fetch: fakeFetch });
            }
            catch (e) {
                chai_1.expect(e.code).to.equal('NOT_FOUND');
                return;
            }
            chai_1.expect.fail();
        }));
        it('throws NOT_FOUND when erroring while fetching from remote', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFetch = () => { throw new Error(); };
            try {
                yield ConfigClient.getEndpointFromRemote('id', { fetch: fakeFetch });
            }
            catch (e) {
                chai_1.expect(e.code).to.equal('NOT_FOUND');
                return;
            }
            chai_1.expect.fail();
        }));
    });
    describe('#getCredsAsSmartContract', () => {
        it('returns false when credentials arent found in files', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => { throw new Error(); };
            chai_1.expect(yield ConfigClient.getCredsAsSmartContract({ readFileAsync: fakeFile })).to.equal(false);
        }));
        it('returns values from files as credentials', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fakeFile = () => 'thing';
            chai_1.expect(yield ConfigClient.getCredsAsSmartContract({ readFileAsync: fakeFile })).to.deep.equal({ authKey: 'thing', authKeyId: 'thing' });
        }));
    });
    describe('#getDragonchainId', () => {
        it('returns ID from env vars', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getIdFromEnvVars = () => 'envId';
            const getIdFromFile = () => 'fileId';
            chai_1.expect(yield ConfigClient.getDragonchainId({ getIdFromEnvVars, getIdFromFile })).to.equal('envId');
        }));
        it('returns ID from config file', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getIdFromEnvVars = () => '';
            const getIdFromFile = () => 'fileId';
            chai_1.expect(yield ConfigClient.getDragonchainId({ getIdFromEnvVars, getIdFromFile })).to.equal('fileId');
        }));
        it('throws NOT_FOUND when not found', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getIdFromEnvVars = () => '';
            const getIdFromFile = () => '';
            try {
                yield ConfigClient.getDragonchainId({ getIdFromEnvVars, getIdFromFile });
            }
            catch (e) {
                chai_1.expect(e.code).to.equal('NOT_FOUND');
                return;
            }
            chai_1.expect.fail();
        }));
    });
    describe('#getDragonchainEndpoint', () => {
        it('returns Endpoint from env vars', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getEndpointFromEnvVars = () => 'envEndpoint';
            chai_1.expect(yield ConfigClient.getDragonchainEndpoint('id', { getEndpointFromEnvVars })).to.equal('envEndpoint');
        }));
        it('returns Endpoint from config file', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getEndpointFromEnvVars = () => '';
            const getEndpointFromFile = () => 'fileEndpoint';
            chai_1.expect(yield ConfigClient.getDragonchainEndpoint('id', { getEndpointFromEnvVars, getEndpointFromFile })).to.equal('fileEndpoint');
        }));
        it('returns Endpoint from remote', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getEndpointFromEnvVars = () => '';
            const getEndpointFromFile = () => '';
            const getEndpointFromRemote = () => 'remoteEndpoint';
            chai_1.expect(yield ConfigClient.getDragonchainEndpoint('id', { getEndpointFromEnvVars, getEndpointFromFile, getEndpointFromRemote })).to.equal('remoteEndpoint');
        }));
        it('throws Error from getEndpointFromRemote', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const error = new Error('thing');
            const getEndpointFromEnvVars = () => '';
            const getEndpointFromFile = () => '';
            const getEndpointFromRemote = () => { throw error; };
            try {
                yield ConfigClient.getDragonchainEndpoint('id', { getEndpointFromEnvVars, getEndpointFromFile, getEndpointFromRemote });
            }
            catch (e) {
                chai_1.expect(e).to.equal(error);
                return;
            }
            chai_1.expect.fail();
        }));
    });
    describe('#getDragonchainCredentials', () => {
        it('returns credentials from env vars', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const creds = { authKey: 'thing', authKeyId: 'keyid' };
            const getCredsFromEnvVars = () => creds;
            chai_1.expect(yield ConfigClient.getDragonchainCredentials('id', { getCredsFromEnvVars })).to.equal(creds);
        }));
        it('returns credentials from config file', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const creds = { authKey: 'thing', authKeyId: 'keyid' };
            const getCredsFromEnvVars = () => false;
            const getCredsFromFile = () => creds;
            chai_1.expect(yield ConfigClient.getDragonchainCredentials('id', { getCredsFromEnvVars, getCredsFromFile })).to.equal(creds);
        }));
        it('returns credentials from smart contract location', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const creds = { authKey: 'thing', authKeyId: 'keyid' };
            const getCredsFromEnvVars = () => false;
            const getCredsFromFile = () => false;
            const getCredsAsSmartContract = () => creds;
            chai_1.expect(yield ConfigClient.getDragonchainCredentials('id', { getCredsFromEnvVars, getCredsFromFile, getCredsAsSmartContract })).to.equal(creds);
        }));
        it('throws NOT_FOUND when not found', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const getCredsFromEnvVars = () => false;
            const getCredsFromFile = () => false;
            const getCredsAsSmartContract = () => false;
            try {
                yield ConfigClient.getDragonchainCredentials('id', { getCredsFromEnvVars, getCredsFromFile, getCredsAsSmartContract });
            }
            catch (e) {
                chai_1.expect(e.code).to.equal('NOT_FOUND');
                return;
            }
            chai_1.expect.fail();
        }));
    });
});
/**
 * All Humans are welcome.
 */
