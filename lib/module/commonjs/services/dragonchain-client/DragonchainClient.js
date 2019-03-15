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
const node_fetch_1 = require("node-fetch");
const fs_1 = require("fs");
const CredentialService_1 = require("../credential-service/CredentialService");
const url_1 = require("url");
const index_1 = require("../../index");
const FailureByDesign_1 = require("../../errors/FailureByDesign");
const validSmartContractTypes = [
    'transaction',
    'cron'
];
/**
 * HTTP Client that interfaces with the dragonchain api, using credentials stored on your machine.
 * @class DragonchainClient
 */
class DragonchainClient {
    /**
     * Create an Instance of a DragonchainClient.
     * @param dragonchainId id of a target dragonchain
     * @param verify verify SSL Certs when talking to local dragonchains
     * @param injected used only for testing
     */
    constructor(dragonchainId = '', verify = true, injected = {}) {
        /**
         * This method is used to override this SDK's attempt to automatically fetch credentials automatically with manually specified creds
         *
         * @param {string} authKeyId Auth Key ID used in HMAC
         * @param {string} authKey Auth Key used in HMAC
         */
        this.overrideCredentials = (authKeyId, authKey) => {
            this.credentialService.overrideCredentials(authKeyId, authKey);
        };
        /**
         * Change the dragonchainId for this DragonchainClient instance.
         *
         * After using this command, subsequent requests to your dragonchain will attempt to re-locate credentials for the new dragonchain
         * @param dragonchainId The id of the dragonchain you want to set
         * @param setEndpoint Whether or not to set a new endpoint automatically (for managed chains at .api.dragonchain.com)
         */
        this.setDragonchainId = (dragonchainId, setEndpoint = true) => {
            this.credentialService = new CredentialService_1.CredentialService(dragonchainId);
            if (setEndpoint)
                this.setEndpoint(`https://${dragonchainId}.api.dragonchain.com`);
        };
        /**
         * Change the endpoint for this DragonchainClient instance.
         *
         * @param endpoint The endpoint of the dragonchain you want to set
         */
        this.setEndpoint = (endpoint) => {
            this.endpoint = endpoint;
        };
        /**
         * Reads secrets given to a smart contract
         *
         * @param secretName the name of the secret to retrieve for smart contract
         */
        this.getSecret = (secretName) => this.readFileSync(`/var/openfaas/secret/sc-${process.env.SMART_CONTRACT_ID}-${secretName}`, 'utf-8');
        /**
         * Get a transaction by Id.
         * @param transactionId The transaction id you are looking for.
         */
        this.getTransaction = (transactionId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.get(`/transaction/${transactionId}`);
        });
        /**
         * Query transactions using ElasticSearch query-string syntax
         * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
         * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
         * @example
         * ```javascript
         * myClient.queryTransactions('tag:(bananas OR apples)').then( ...do stuff )
         * ```
         */
        this.queryTransactions = (luceneQuery, sort, offset = 0, limit = 10) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const queryParams = this.getLuceneParams(luceneQuery, sort, offset, limit);
            return yield this.get(`/transaction${queryParams}`);
        });
        /**
         * get the status of your dragonchain
         */
        this.getStatus = () => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield this.get(`/status`); });
        /**
         * Get a single block by ID
         */
        this.getBlock = (blockId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.get(`/block/${blockId}`);
        });
        /**
         * Query blocks using ElasticSearch query-string syntax
         * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
         * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
         * @example
         * ```javascript
         * myClient.queryBlocks('tag:(bananas OR apples)').then( ...do stuff )
         * ```
         */
        this.queryBlocks = (luceneQuery, sort, offset = 0, limit = 10) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const queryParams = this.getLuceneParams(luceneQuery, sort, offset, limit);
            return yield this.get(`/block${queryParams}`);
        });
        /**
         * Get a single smart contract by id
         */
        this.getSmartContract = (contractId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.get(`/contract/${contractId}`);
        });
        /**
         * Query smart contracts using ElasticSearch query-string syntax
         * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
         * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
         * @example
         * ```javascript
         * myClient.querySmartContracts('tag:(bananas OR apples)').then( ...do stuff )
         * ```
         */
        this.querySmartContracts = (luceneQuery, sort, offset = 0, limit = 10) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const queryParams = this.getLuceneParams(luceneQuery, sort, offset, limit);
            return yield this.get(`/contract${queryParams}`);
        });
        /**
         * Updates existing contract fields
         * @param {string} txnType The name of the existing contract you want to update
         * @param {string} image The docker image containing the smart contract logic
         * @param {string} cmd Entrypoint command to run in the docker container
         * @param {SmartContractExecutionOrder} executionOrder Order of execution. Valid values 'parallel' or 'serial'
         * @param {SmartContractDesiredState} desiredState Change the state of a contract. Valid values are "active" and "inactive". You may only change the state of an active or inactive contract.
         * @param {string[]} args List of arguments to the cmd field
         * @param {object} env mapping of environment variables for your contract
         * @param {object} secrets mapping of secrets for your contract
         * @param {number} seconds The seconds of scheduled execution
         * @param {string} cron The rate of scheduled execution specified as a cron
         * @param {string} auth basic-auth for pulling docker images, base64 encoded (e.g. username:password)
         */
        this.updateSmartContract = (contractId, image, cmd, executionOrder, desiredState, args, env, secrets, seconds, cron, auth) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const body = {
                version: '3',
                dcrn: 'SmartContract::L1::Update'
            };
            if (image)
                body['image'] = image;
            if (cmd)
                body['cmd'] = cmd;
            if (executionOrder)
                body['execution_order'] = executionOrder;
            if (desiredState)
                body['desired_state'] = desiredState;
            if (args)
                body['args'] = args;
            if (env)
                body['env'] = env;
            if (secrets)
                body['secrets'] = secrets;
            if (seconds)
                body['seconds'] = seconds;
            if (cron)
                body['cron'] = cron;
            if (auth)
                body['auth'] = auth;
            return yield this.put(`/contract/${contractId}`, body);
        });
        /**
         * Deletes a smart contract
         * @param {string} contractId
         * @returns {Promise<UpdateResponse>} success message upon successful update
         */
        this.deleteSmartContract = (contractId) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.delete(`/contract/${contractId}`);
        });
        /**
         * Update your matchmaking data. If you are a level 2-4, you're required to update your asking price.
         * @param {number} askingPrice (0.0001-1000.0000) the price in DRGN to charge L1 nodes for your verification of their data. Setting this number too high will cause L1's to ignore you more often.
         * @param {number} broadcastInterval Broadcast Interval is only for level 5 chains
         */
        this.updateMatchmakingConfig = (askingPrice, broadcastInterval) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (askingPrice) {
                if (isNaN(askingPrice) || askingPrice < 0.0001 || askingPrice > 1000) {
                    throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', `askingPrice must be between 0.0001 and 1000.`);
                }
            }
            const matchmakingUpdate = {
                'matchmaking': {
                    'askingPrice': askingPrice,
                    'broadcastInterval': broadcastInterval
                }
            };
            return yield this.put(`/update-matchmaking-data`, matchmakingUpdate);
        });
        /**
         * Update your maximum price for each level of verification.
         * This method is only relevant for L1 nodes.
         * @param {DragonnetConfigSchema} maximumPrices maximum prices (0-1000) to set for each level (in DRGNs) If this number is too low, other nodes will not verify your blocks. Changing this number will affect older unverified blocks first.
         */
        this.updateDragonnetConfig = (maximumPrices) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const dragonnet = {};
            [2, 3, 4, 5].forEach(i => {
                const item = maximumPrices[`l${i}`];
                if (item) {
                    if (isNaN(item) || item < 0 || item > 1000) {
                        throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'maxPrice must be between 0 and 1000.');
                    }
                    dragonnet[`l${i}`] = { maximumPrice: item };
                }
            });
            // Make sure SOME valid levels were provided by checking if dragonnet is an empty object
            if (Object.keys(dragonnet).length === 0)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'No valid levels provided');
            return yield this.put(`/update-matchmaking-data`, { dragonnet });
        });
        /**
         * Create a new Transaction on your Dragonchain.
         * This transaction, if properly structured, will be received by your dragonchain, hashed, and put into a queue for processing into a block.
         * The `transaction_id` returned from this function can be used for checking the status of this transaction.
         * Most importantly; the block in which it has been fixated.
         *
         * @param {DragonchainTransactionCreatePayload} transactionObject
         * @returns {Promise<DragonchainTransactionCreateResponse>}
         */
        this.createTransaction = (transactionObject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.post(`/transaction`, transactionObject);
        });
        /**
         * Create a bulk transaction by string together a bunch of transactions as JSON objects into an array
         * @param {DragonchainBulkTransactions} transactionBulkObject array of transactions
         * @return {Promise<DragonchainTransactionCreateResponse>}
         */
        this.createBulkTransaction = (transactionBulkObject) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.post(`/transaction_bulk`, transactionBulkObject);
        });
        /**
         * Create a new Smart Contract on your Dragonchain.
         * @returns {Promise<DragonchainContractCreateResponse>}
         */
        this.createContract = (body) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.post(`/contract`, body);
        });
        /**
         * Get all the verifications for one block_id.
         * @param {string} block_id
         * @param {number} level
         */
        this.getVerifications = (blockId, level = 0) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (level) {
                return yield this.get(`/verifications/${blockId}?level=${level}`);
            }
            return yield this.get(`/verifications/${blockId}`);
        });
        /**
         * getSmartContractHeap
         * Get from the smart contract heap
         * This function, (unlike other SDK methods) returns raw utf-8 text by design.
         * If you expect the result to be parsed json pass `true` as the jsonParse parameter.
         * @param {string} key the key under which data has been stored in heap
         * @param {string} scName the name of smart contract
         * @param {boolean} jsonParse attempt to parse heap data as JSON. Throws JSONParse error if it fails.
         */
        this.getSmartContractHeap = (key, scName, jsonParse = false) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const response = yield this.get(`/get/${scName}/${key}`, jsonParse);
            return response;
        });
        /**
         * listSmartcontractHeap
         * List objects from a smart contract heap
         * @param {string} scName the name of smart contract
         * @param {string} key the sub-key ('folder') to list in the SC heap (optional. Defaults to root of SC heap)
         */
        this.listSmartcontractHeap = (scName, key = '') => tslib_1.__awaiter(this, void 0, void 0, function* () {
            let path = `/list/${scName}/`;
            if (key)
                path += key;
            return yield this.get(path);
        });
        /**
         * registerTransactionType
         * Registers a new transaction type
         * @param {TransactionTypeStructure} txnTypeStructure
         */
        this.registerTransactionType = (txnTypeStructure) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.post('/transaction-type', txnTypeStructure);
        });
        /**
         * deleteTransactionType
         * Deletes existing registered transaction type
         * @param {string} transactionType
         */
        this.deleteTransactionType = (transactionType) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.delete(`/transaction-type/${transactionType}`);
        });
        /**
         * listTransactionTypes
         * Lists current accepted transaction types for a chain
         */
        this.listTransactionTypes = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.get('/transaction-types');
        });
        /**
         * updateTransactionType
         * Updates a given transaction type structure
         * @param {string} transactionType
         * @param {CustomIndexStructure} customIndexes
         */
        this.updateTransactionType = (transactionType, customIndexes) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const params = { version: '1', custom_indexes: customIndexes };
            return yield this.put(`/transaction-type/${transactionType}`, params);
        });
        /**
         * @hidden
         * getTransactionType
         * Gets a specific transaction type
         * @param {string} transactionType
         */
        this.getTransactionType = (transactionType) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.get(`/transaction-type/${transactionType}`);
        });
        /**
         * @hidden
         */
        this.getLuceneParams = (query, sort, offset = 0, limit = 10) => {
            const params = new Map();
            if (query) {
                params.set('q', query);
            }
            if (sort) {
                params.set('sort', sort);
            }
            params.set('offset', String(offset));
            params.set('limit', String(limit));
            return this.generateQueryString(params);
        };
        /**
         * @hidden
         */
        this.generateQueryString = (queryObject) => {
            const query = '?';
            const params = new url_1.URLSearchParams(queryObject);
            const queryString = `${query}${params}`;
            return queryString;
        };
        /**
         * @hidden
         * @name toggleSslCertVerification
         * @description For development purposes only! NodeJS naturally distrusts self signed certs (for good reason!). This function allows users the option to "not care" about self signed certs.
         * @param {function} asyncFunction an async function to call while NODE_TLS_REJECT_UNAUTHORIZED is quickly toggled from "1" to "0" and back to "1"
         */
        this.toggleSslCertVerification = (asyncFunction) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = (this.verify ? '1' : '0');
            const result = yield asyncFunction();
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
            return result;
        });
        if (!dragonchainId) {
            index_1.logger.debug('Dragonchain ID explicitly provided, will not search env/disk');
            dragonchainId = CredentialService_1.CredentialService.getDragonchainId();
        }
        this.verify = verify;
        this.endpoint = `https://${dragonchainId}.api.dragonchain.com`;
        this.fetch = injected.fetch || node_fetch_1.default;
        this.readFileSync = injected.readFileSync || fs_1.readFileSync;
        this.credentialService = injected.CredentialService || new CredentialService_1.CredentialService(dragonchainId);
    }
    /**
     * @hidden
     */
    get(path, jsonParse = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.makeRequest(path, 'GET', '', jsonParse);
        });
    }
    /**
     * @hidden
     */
    post(path, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
            return this.makeRequest(path, 'POST', bodyString);
        });
    }
    /**
     * @hidden
     */
    put(path, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
            return this.makeRequest(path, 'PUT', bodyString);
        });
    }
    /**
     * @hidden
     */
    delete(path) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.makeRequest(path, 'DELETE');
        });
    }
    /**
     * @hidden
     */
    getFetchOptions(method, path, body, contentType = 'application/json') {
        const timestamp = new Date().toISOString();
        return {
            method: method,
            body: body || undefined,
            headers: {
                'Content-Type': contentType,
                dragonchain: this.credentialService.dragonchainId,
                Authorization: this.credentialService.getAuthorizationHeader(method, path, timestamp, contentType, body || ''),
                timestamp
            }
        };
    }
    /**
     * @hidden
     */
    makeRequest(path, method, body = '', jsonParse = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const fetchData = this.getFetchOptions(method, path, body);
            const url = `${this.endpoint}${path}`;
            index_1.logger.debug(`[DragonchainClient][FETCH][URL] ==> ${url}`);
            index_1.logger.debug(`[DragonchainClient][FETCH][DATA] ==> ${JSON.stringify(fetchData)}`);
            // TODO: Use a custom https agent with fetch to properly ignore invalid HTTPS certs without an env var race condition
            const res = yield this.toggleSslCertVerification(() => tslib_1.__awaiter(this, void 0, void 0, function* () { return this.fetch(url, fetchData); }));
            const { status, ok, statusText } = res;
            index_1.logger.debug(`[DragonchainClient][${method}] <== ${url} ${status} ${statusText}`);
            const response = yield (jsonParse ? res.json() : res.text());
            index_1.logger.debug(`[DragonchainClient][${method}] <== ${JSON.stringify(response)}`);
            return { status, response, ok };
        });
    }
}
/**
 * Checks if a smart contract type string is valid
 * @hidden
 * @static
 * @name isValidSmartContractType
 * @param {SmartContractType} smartContractType smartContractType to validate
 * @returns {boolean} true if smart contract type is valid, false if not
 */
DragonchainClient.isValidSmartContractType = (smartContractType) => validSmartContractTypes.includes(smartContractType);
exports.DragonchainClient = DragonchainClient;
/**
 * All Humans are welcome.
 */
