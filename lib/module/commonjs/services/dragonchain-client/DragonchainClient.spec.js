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
const chai = require("chai");
const sinonChai = require("sinon-chai");
const sinon_1 = require("sinon");
const DragonchainClient_1 = require("./DragonchainClient");
const CredentialService_1 = require("../credential-service/CredentialService");
const expect = chai.expect;
chai.use(sinonChai);
let fakeTimeStamp;
let fakeTime;
describe('DragonchainClient', () => {
    describe('#constructor', () => {
        it('returns instance of DragonchainClient', () => {
            const client = new DragonchainClient_1.DragonchainClient('banana', new CredentialService_1.CredentialService('id', { authKey: 'key', authKeyId: 'keyId' }, 'SHA256'), true);
            expect(client instanceof DragonchainClient_1.DragonchainClient).to.equal(true);
        });
    });
    describe('GET', () => {
        let fakeResponseObj;
        let fetch;
        let readFileAsync;
        let CredentialService;
        let logger;
        let client;
        let expectedFetchOptions;
        let fakeResponseText;
        let fakeSecretText;
        beforeEach(() => {
            fakeResponseObj = { body: 'fakeResponseBody' };
            fakeResponseText = 'fakeString';
            fakeSecretText = 'fakeSecret';
            fetch = sinon_1.stub().resolves({ status: 200, json: sinon_1.stub().resolves(fakeResponseObj), text: sinon_1.stub().resolves(fakeResponseText) });
            readFileAsync = sinon_1.stub().returns(fakeSecretText);
            CredentialService = { getAuthorizationHeader: sinon_1.stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' };
            logger = { log: sinon_1.stub(), debug: sinon_1.stub() };
            const injected = { logger, fetch, readFileAsync };
            client = new DragonchainClient_1.DragonchainClient('fakeUrl', CredentialService, true, injected);
            fakeTimeStamp = Date.now();
            sinon_1.useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false });
            fakeTime = new Date(fakeTimeStamp).toISOString();
            expectedFetchOptions = {
                method: 'GET',
                body: undefined,
                headers: {
                    'dragonchain': 'fakeDragonchainId',
                    'Authorization': 'fakeCreds',
                    'timestamp': fakeTime
                }
            };
        });
        describe('.getSmartContractSecret', () => {
            it('calls readFileAsync with correct dragonchain id and secret name', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                process.env.SMART_CONTRACT_ID = 'fakeSmartContractId';
                yield client.getSmartContractSecret({ secretName: 'fakeSecretName' });
                sinon_1.assert.calledWith(readFileAsync, '/var/openfaas/secrets/sc-fakeSmartContractId-fakeSecretName', 'utf-8');
            }));
        });
        describe('.getStatus', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield client.getStatus();
                sinon_1.assert.calledWith(fetch, 'fakeUrl/status', expectedFetchOptions);
            }));
        });
        describe('.getTransaction', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const id = 'batman-transaction-id';
                yield client.getTransaction({ transactionId: id });
                sinon_1.assert.calledWith(fetch, `fakeUrl/transaction/${id}`, expectedFetchOptions);
            }));
        });
        describe('.getBlock', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const id = 'robin-block-id';
                yield client.getBlock({ blockId: id });
                sinon_1.assert.calledWith(fetch, `fakeUrl/block/${id}`, expectedFetchOptions);
            }));
        });
        describe('.getSmartContract', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const id = 'joker-smartcontract-id';
                yield client.getSmartContract({ smartContractId: id });
                sinon_1.assert.calledWith(fetch, `fakeUrl/contract/${id}`, expectedFetchOptions);
            }));
        });
        describe('.getPublicBlockchainAddresses', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield client.getPublicBlockchainAddresses();
                sinon_1.assert.calledWith(fetch, 'fakeUrl/public-blockchain-address', expectedFetchOptions);
            }));
        });
        describe('.getVerifications', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const id = 'block_id';
                yield client.getVerifications({ blockId: id });
                sinon_1.assert.calledWith(fetch, `fakeUrl/verifications/${id}`, expectedFetchOptions);
            }));
        });
        describe('.queryBlocks', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const params = 'banana';
                yield client.queryBlocks({ luceneQuery: params });
                sinon_1.assert.calledWith(fetch, `fakeUrl/block?q=${params}&offset=0&limit=10`, expectedFetchOptions);
            }));
        });
        describe('.querySmartContracts', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const params = 'banana';
                yield client.querySmartContracts({ luceneQuery: params });
                sinon_1.assert.calledWith(fetch, `fakeUrl/contract?q=${params}&offset=0&limit=10`, expectedFetchOptions);
            }));
        });
    });
    describe('DELETE', () => {
        const fakeResponseObj = { body: 'fakeResponseBody' };
        const fakeResponseText = 'fakeString';
        const fetch = sinon_1.stub().resolves({ status: 200, json: sinon_1.stub().resolves(fakeResponseObj), text: sinon_1.stub().resolves(fakeResponseText) });
        const CredentialService = { getAuthorizationHeader: sinon_1.stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' };
        const logger = { log: sinon_1.stub(), debug: sinon_1.stub() };
        const injected = { logger, fetch };
        const client = new DragonchainClient_1.DragonchainClient('fakeUrl', CredentialService, true, injected);
        fakeTimeStamp = Date.now();
        sinon_1.useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false });
        fakeTime = new Date(fakeTimeStamp).toISOString();
        const expectedFetchOptions = {
            method: 'DELETE',
            headers: {
                dragonchain: 'fakeDragonchainId',
                Authorization: 'fakeCreds',
                timestamp: fakeTime
            },
            body: undefined
        };
        it('.deleteSmartContract', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const param = 'banana';
            yield client.deleteSmartContract({ smartContractId: param });
            sinon_1.assert.calledWith(fetch, 'fakeUrl/contract/banana', expectedFetchOptions);
        }));
    });
    describe('POST', () => {
        const fakeResponseObj = { body: 'fakeResponseBody' };
        const fakeResponseText = 'fakeString';
        const fetch = sinon_1.stub().resolves({ status: 200, json: sinon_1.stub().resolves(fakeResponseObj), text: sinon_1.stub().resolves(fakeResponseText) });
        const CredentialService = { getAuthorizationHeader: sinon_1.stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' };
        const logger = { log: sinon_1.stub(), debug: sinon_1.stub() };
        const injected = { logger, CredentialService, fetch };
        const client = new DragonchainClient_1.DragonchainClient('fakeUrl', CredentialService, true, injected);
        fakeTimeStamp = Date.now();
        sinon_1.useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false });
        fakeTime = new Date(fakeTimeStamp).toISOString();
        const expectedFetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'dragonchain': 'fakeDragonchainId',
                'Authorization': 'fakeCreds',
                'timestamp': fakeTime
            }
        };
        describe('.createTransaction', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const transactionCreatePayload = {
                    transactionType: 'transaction',
                    payload: 'hi!',
                    tag: 'Awesome!'
                };
                const expectedBody = {
                    version: '1',
                    txn_type: transactionCreatePayload.transactionType,
                    payload: transactionCreatePayload.payload,
                    tag: transactionCreatePayload.tag
                };
                yield client.createTransaction(transactionCreatePayload);
                const obj = Object.assign({}, expectedFetchOptions, { body: JSON.stringify(expectedBody) });
                sinon_1.assert.calledWith(fetch, 'fakeUrl/transaction', obj);
            }));
        });
        describe('.createSmartContract', () => {
            it('create custom contract successfully', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const contractPayload = {
                    transactionType: 'name',
                    image: 'ubuntu:latest',
                    environmentVariables: { 'banana': 'banana', 'apple': 'banana' },
                    cmd: 'banana',
                    args: ['-m', 'cool']
                };
                const expectedBody = {
                    version: '3',
                    image: contractPayload.image,
                    cmd: contractPayload.cmd,
                    args: contractPayload.args,
                    env: contractPayload.environmentVariables
                };
                yield client.createSmartContract(contractPayload);
                const obj = Object.assign({}, expectedFetchOptions, { body: JSON.stringify(expectedBody) });
                sinon_1.assert.calledWith(fetch, 'fakeUrl/contract', obj);
            }));
        });
        describe('.createEthereumTransaction', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const transactionCreatePayload = {
                    network: 'ETH_MAINNET',
                    to: '0x0000000000000000000000000000000000000000',
                    value: '0x0'
                };
                const expectedBody = {
                    network: transactionCreatePayload.network,
                    transaction: {
                        to: transactionCreatePayload.to,
                        value: transactionCreatePayload.value
                    }
                };
                yield client.createEthereumTransaction(transactionCreatePayload);
                const obj = Object.assign({}, expectedFetchOptions, { body: JSON.stringify(expectedBody) });
                sinon_1.assert.calledWith(fetch, 'fakeUrl/public-blockchain-transaction', obj);
            }));
        });
    });
    describe('PUT', () => {
        const fakeResponseObj = { body: 'fakeResponseBody' };
        const fakeResponseText = 'fakeString';
        const fetch = sinon_1.stub().resolves({ status: 200, json: sinon_1.stub().resolves(fakeResponseObj), text: sinon_1.stub().resolves(fakeResponseText) });
        const CredentialService = { getAuthorizationHeader: sinon_1.stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' };
        const logger = { log: sinon_1.stub(), debug: sinon_1.stub() };
        const injected = { logger, CredentialService, fetch };
        const client = new DragonchainClient_1.DragonchainClient('fakeUrl', CredentialService, true, injected);
        fakeTimeStamp = Date.now();
        sinon_1.useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false });
        fakeTime = new Date(fakeTimeStamp).toISOString();
        const expectedFetchOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'dragonchain': 'fakeDragonchainId',
                'Authorization': 'fakeCreds',
                'timestamp': fakeTime
            }
        };
        describe('.updateSmartContract', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const smartContractId = '616152367378';
                const status = 'active';
                const fakeBodyResponse = {
                    'version': '3',
                    'desired_state': status
                };
                yield client.updateSmartContract({ smartContractId, enabled: true });
                const obj = Object.assign({}, expectedFetchOptions, { body: JSON.stringify(fakeBodyResponse) });
                sinon_1.assert.calledWith(fetch, `fakeUrl/contract/${smartContractId}`, obj);
            }));
        });
    });
});
/**
 * All Humans are welcome.
 */
