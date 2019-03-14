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
// ContractCreateCurrencyContract
/**
 * @hidden
 */
const expect = chai.expect;
chai.use(sinonChai);
/**
 * @hidden
 */
let fakeTimeStamp;
/**
 * @hidden
 */
let fakeTime;
describe('DragonchainClient', () => {
    describe('#constructor', () => {
        it('returns instance of DragonchainClient', () => {
            const client = new DragonchainClient_1.DragonchainClient('banana');
            expect(client instanceof DragonchainClient_1.DragonchainClient).to.equal(true);
        });
    });
    describe('.isValidSmartContractType', () => {
        it('returns true when valid', () => {
            expect(DragonchainClient_1.DragonchainClient.isValidSmartContractType('transaction')).to.equal(true);
            expect(DragonchainClient_1.DragonchainClient.isValidSmartContractType('cron')).to.equal(true);
        });
        it('returns false when invalid', () => {
            expect(DragonchainClient_1.DragonchainClient.isValidSmartContractType('derp')).to.equal(false);
        });
    });
    describe('GET', () => {
        let fakeResponseObj;
        let fetch;
        let readFileSync;
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
            readFileSync = sinon_1.stub().returns(fakeSecretText);
            CredentialService = { getAuthorizationHeader: sinon_1.stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' };
            logger = { log: sinon_1.stub(), debug: sinon_1.stub() };
            const injected = { logger, CredentialService, fetch, readFileSync };
            client = new DragonchainClient_1.DragonchainClient('fakeDragonchainId', true, injected);
            fakeTimeStamp = Date.now();
            sinon_1.useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false });
            fakeTime = new Date(fakeTimeStamp).toISOString();
            expectedFetchOptions = {
                method: 'GET',
                body: undefined,
                headers: {
                    'Content-Type': 'application/json',
                    dragonchain: 'fakeDragonchainId',
                    Authorization: 'fakeCreds',
                    timestamp: fakeTime
                }
            };
        });
        describe('.getSecret', () => {
            it('calls readFileSync with correct dragonchain id and secret name', () => {
                process.env.SMART_CONTRACT_ID = 'fakeSmartContractId';
                client.getSecret('fakeSecretName');
                sinon_1.assert.calledWith(readFileSync, '/var/openfaas/secret/sc-fakeSmartContractId-fakeSecretName', 'utf-8');
            });
        });
        describe('.getStatus', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                yield client.getStatus();
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/status`, expectedFetchOptions);
            }));
        });
        describe('.getTransaction', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const id = 'batman-transaction-id';
                yield client.getTransaction(id);
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/transaction/${id}`, expectedFetchOptions);
            }));
        });
        describe('.setDragonchainId', () => {
            it('allows resetting the dragonchainId', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                client.setDragonchainId('hotBanana');
                yield client.getStatus();
                expectedFetchOptions.headers.dragonchain = 'hotBanana';
                sinon_1.assert.calledWith(fetch, 'https://hotBanana.api.dragonchain.com/status', sinon_1.match({ headers: { dragonchain: 'hotBanana' } }));
            }));
        });
        describe('.setEndpoint', () => {
            it('allows setting the endpoint manually', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const endpoint = 'https://some.domain.com';
                client.setEndpoint(endpoint);
                yield client.getStatus();
                sinon_1.assert.calledWith(fetch, `${endpoint}/status`, expectedFetchOptions);
            }));
        });
        describe('.getBlock', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const id = 'robin-block-id';
                yield client.getBlock(id);
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/block/${id}`, expectedFetchOptions);
            }));
        });
        describe('.getSmartContract', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const id = 'joker-smartcontract-id';
                yield client.getSmartContract(id);
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract/${id}`, expectedFetchOptions);
            }));
        });
        describe('.getVerification', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const id = 'block_id';
                yield client.getVerifications(id);
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/verifications/${id}`, expectedFetchOptions);
            }));
        });
        describe('.queryBlocks', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const params = 'banana';
                yield client.queryBlocks(params);
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/block?q=${params}&offset=0&limit=10`, expectedFetchOptions);
            }));
        });
        describe('.querySmartContracts', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const params = 'banana';
                yield client.querySmartContracts(params);
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract?q=${params}&offset=0&limit=10`, expectedFetchOptions);
            }));
        });
    });
    describe('DELETE', () => {
        const fakeResponseObj = { body: 'fakeResponseBody' };
        const fakeResponseText = 'fakeString';
        const fetch = sinon_1.stub().resolves({ status: 200, json: sinon_1.stub().resolves(fakeResponseObj), text: sinon_1.stub().resolves(fakeResponseText) });
        const CredentialService = { getAuthorizationHeader: sinon_1.stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' };
        const logger = { log: sinon_1.stub(), debug: sinon_1.stub() };
        const injected = { logger, CredentialService, fetch };
        const client = new DragonchainClient_1.DragonchainClient('fakeDragonchainId', true, injected);
        fakeTimeStamp = Date.now();
        sinon_1.useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false });
        fakeTime = new Date(fakeTimeStamp).toISOString();
        const expectedFetchOptions = {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                dragonchain: 'fakeDragonchainId',
                Authorization: 'fakeCreds',
                timestamp: fakeTime
            },
            body: undefined
        };
        it('.deleteSmartContract', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const param = 'banana';
            yield client.deleteSmartContract(param);
            sinon_1.assert.calledWith(fetch, 'https://fakeDragonchainId.api.dragonchain.com/contract/banana', expectedFetchOptions);
        }));
    });
    describe('POST', () => {
        const fakeResponseObj = { body: 'fakeResponseBody' };
        const fakeResponseText = 'fakeString';
        const fetch = sinon_1.stub().resolves({ status: 200, json: sinon_1.stub().resolves(fakeResponseObj), text: sinon_1.stub().resolves(fakeResponseText) });
        const CredentialService = { getAuthorizationHeader: sinon_1.stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' };
        const logger = { log: sinon_1.stub(), debug: sinon_1.stub() };
        const injected = { logger, CredentialService, fetch };
        const client = new DragonchainClient_1.DragonchainClient('fakeDragonchainId', true, injected);
        fakeTimeStamp = Date.now();
        sinon_1.useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false });
        fakeTime = new Date(fakeTimeStamp).toISOString();
        const expectedFetchOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                dragonchain: 'fakeDragonchainId',
                Authorization: 'fakeCreds',
                timestamp: fakeTime
            }
        };
        describe('.createTransaction', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const transactionCreatePayload = {
                    version: '1',
                    txn_type: 'transaction',
                    payload: 'hi!',
                    tag: 'Awesome!'
                };
                yield client.createTransaction(transactionCreatePayload);
                const obj = Object.assign({}, expectedFetchOptions, { body: JSON.stringify(transactionCreatePayload) });
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/transaction`, obj);
            }));
        });
        describe('.createContract', () => {
            it('create custom contract successfully', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const contractPayload = {
                    'version': '3',
                    'dcrn': 'SmartContract::L1::Create',
                    'txn_type': 'name',
                    'image': 'ubuntu:latest',
                    'execution_order': 'serial',
                    'env': { 'banana': 'banana', 'apple': 'banana' },
                    'cmd': 'banana',
                    'args': ['-m cool']
                };
                yield client.createContract(contractPayload);
                const obj = Object.assign({}, expectedFetchOptions, { body: JSON.stringify(contractPayload) });
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract`, obj);
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
        const client = new DragonchainClient_1.DragonchainClient('fakeDragonchainId', true, injected);
        fakeTimeStamp = Date.now();
        sinon_1.useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false });
        fakeTime = new Date(fakeTimeStamp).toISOString();
        const expectedFetchOptions = {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                dragonchain: 'fakeDragonchainId',
                Authorization: 'fakeCreds',
                timestamp: fakeTime
            }
        };
        describe('.updateSmartContract', () => {
            it('calls #fetch() with correct params', () => tslib_1.__awaiter(this, void 0, void 0, function* () {
                const txnType = '616152367378';
                const status = 'active';
                const fakeBodyResponse = {
                    'version': '3',
                    'dcrn': 'SmartContract::L1::Update',
                    'desired_state': status
                };
                yield client.updateSmartContract(txnType, undefined, undefined, undefined, status);
                const id = '616152367378';
                const obj = Object.assign({}, expectedFetchOptions, { body: JSON.stringify(fakeBodyResponse) });
                sinon_1.assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract/${id}`, obj);
            }));
        });
    });
});
/**
 * All Humans are welcome.
 */
