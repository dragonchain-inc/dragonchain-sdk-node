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
import { CredentialService } from './CredentialService';
import { createSandbox } from 'sinon';
describe('CredentialService', () => {
    const testBed = createSandbox();
    let credentialService;
    afterEach(() => {
        testBed.restore();
    });
    beforeEach(() => {
        credentialService = new CredentialService('testId', 'key', 'keyId');
    });
    describe('#constructor', () => {
        it('initializes with correct variables', () => {
            const dcid = 'dcid';
            const key = 'key';
            const keyId = 'keyId';
            const algo = 'SHA256';
            const service = new CredentialService(dcid, key, keyId, algo);
            expect(service.dragonchainId).to.equal(dcid);
            expect(service.credentials.authKey).to.equal(key);
            expect(service.credentials.authKeyId).to.equal(keyId);
            expect(service.hmacAlgo).to.equal(algo);
        });
    });
    describe('#getIdFromEnvVars', () => {
        it('returns the environment variable when set', () => {
            process.env.DRAGONCHAIN_ID = 'something';
            expect(CredentialService.getIdFromEnvVars()).to.equal('something');
        });
        it('returns an empty string when the variable is not set', () => {
            delete process.env.DRAGONCHAIN_ID;
            expect(CredentialService.getIdFromEnvVars()).to.equal('');
        });
    });
    describe('#getCredsFromEnvVars', () => {
        it('returns the creds from environment when set', () => {
            process.env.AUTH_KEY = 'aKey';
            process.env.AUTH_KEY_ID = 'aKeyId';
            expect(CredentialService.getCredsFromEnvVars()).to.deep.equal({ authKey: 'aKey', authKeyId: 'aKeyId' });
        });
        it('returns an false when environment is not set', () => {
            delete process.env.AUTH_KEY;
            delete process.env.AUTH_KEY_ID;
            expect(CredentialService.getCredsFromEnvVars()).to.equal(false);
        });
    });
    describe('.overrideCredentials', () => {
        it('sets new credentials correctly', () => {
            const newKey = 'some value';
            const newKeyId = 'another value';
            credentialService.overrideCredentials(newKeyId, newKey);
            expect(credentialService.credentials.authKey).to.equal(newKey);
            expect(credentialService.credentials.authKeyId).to.equal(newKeyId);
        });
    });
    describe('.getAuthorizationHeader', () => {
        it('returns expected hmac', () => {
            const result = credentialService.getAuthorizationHeader('GET', '/path', 'timestamp', 'application/json', '');
            expect(result).to.equal('DC1-HMAC-SHA256 keyId:8Bc+h0parZxGeMB9rYzzRUuNxxHSIjGqSD4W/635A9k=');
            const result2 = credentialService.getAuthorizationHeader('POST', '/new_path', 'timestamp', 'application/json', '"body"');
            expect(result2).to.equal('DC1-HMAC-SHA256 keyId:PkVjUxWZr6ST4xh+JxYFZresaFhQbk8sggWqyWv/XkU=');
        });
    });
});
