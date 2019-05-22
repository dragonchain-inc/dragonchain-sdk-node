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
const util_1 = require("util");
const fs_1 = require("fs");
const path = require("path");
const node_fetch_1 = require("node-fetch");
const CredentialService_1 = require("../credential-service/CredentialService");
const config_service_1 = require("../config-service");
const url_1 = require("url");
const index_1 = require("../../index");
const FailureByDesign_1 = require("../../errors/FailureByDesign");
/**
 * @hidden
 */
const readFileAsync = util_1.promisify(fs_1.readFile);
/**
 * HTTP Client that interfaces with the dragonchain api
 */
class DragonchainClient {
    /**
     * @hidden
     * Construct an instance of a DragonchainClient. THIS SHOULD NOT BE CALLED DIRECTLY. Instead use the `createClient` function to instantiate a client
     */
    constructor(endpoint, credentials, verify, injected = {}) {
        /**
         * Reads secrets provided to a smart contract
         *
         * Note: This will only work when running within a smart contract, given that the smart contract was created/updated with secrets
         */
        this.getSmartContractSecret = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.secretName)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `secretName` is required');
            const secretPath = path.join('/', 'var', 'openfaas', 'secrets', `sc-${process.env.SMART_CONTRACT_ID}-${options.secretName}`);
            return yield this.readFileAsync(secretPath, 'utf-8');
        });
        /**
         * Get the status of your dragonchain
         */
        this.getStatus = () => tslib_1.__awaiter(this, void 0, void 0, function* () { return yield this.get('/status'); });
        /**
         * Get a transaction by id
         */
        this.getTransaction = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.transactionId)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `transactionId` is required');
            return yield this.get(`/transaction/${options.transactionId}`);
        });
        /**
         * Create a new Transaction on your Dragonchain.
         *
         * This transaction, if properly structured, will be received by your dragonchain, hashed, and put into a queue for processing into a block.
         *
         * A POST request is made to the callback URL when the transaction has settled into a block on the Blockchain.
         *
         * The `transaction_id` returned from this function can be used for checking the status of this transaction, including the block in which it was included.
         */
        this.createTransaction = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.transactionType)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `transactionType` is required');
            if (!options.payload)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `payload` is required');
            const transactionBody = {
                version: '1',
                txn_type: options.transactionType,
                payload: options.payload
            };
            if (options.tag)
                transactionBody.tag = options.tag;
            return yield this.post('/transaction', transactionBody, options.callbackURL);
        });
        /**
         * Create a bulk transaction to send many transactions to a chain with only a single call
         */
        this.createBulkTransaction = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.transactionList)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'parameter `transactionList` is required');
            let bulkTransactionBody = [];
            options.transactionList.forEach(transaction => {
                const singleBody = {
                    version: '1',
                    txn_type: transaction.transactionType,
                    payload: transaction.payload
                };
                if (transaction.tag)
                    singleBody.tag = transaction.tag;
                bulkTransactionBody.push(singleBody);
            });
            return yield this.post(`/transaction_bulk`, bulkTransactionBody);
        });
        /**
         * Query transactions using ElasticSearch query-string syntax
         *
         * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
         * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
         * @example
         * ```javascript
         * myClient.queryTransactions({luceneQuery: 'tag:(bananas OR apples)'}).then( ...do stuff )
         * ```
         */
        this.queryTransactions = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const queryParams = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10);
            return yield this.get(`/transaction${queryParams}`);
        });
        /**
         * Get a single block by ID
         */
        this.getBlock = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.blockId)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `blockId` is required');
            return yield this.get(`/block/${options.blockId}`);
        });
        /**
         * Query blocks using ElasticSearch query-string syntax
         *
         * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
         * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
         * @example
         * ```javascript
         * myClient.queryBlocks({sort: 'block_id:asc'}).then( ...do stuff )
         * ```
         */
        this.queryBlocks = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const queryParams = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10);
            return yield this.get(`/block${queryParams}`);
        });
        /**
         * Create a new Smart Contract on your Dragonchain
         */
        this.createSmartContract = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.transactionType)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `transactionType` is required');
            if (!options.image)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `image` is required');
            if (!options.cmd)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `cmd` is required');
            if (options.scheduleIntervalInSeconds && options.cronExpression)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameters `scheduleIntervalInSeconds` and `cronExpression` are mutually exclusive');
            const body = {
                version: '3',
                image: options.image,
                cmd: options.cmd
            };
            if (options.args)
                body.args = options.args;
            if (options.executionOrder)
                body.execution_order = options.executionOrder;
            if (options.environmentVariables)
                body.env = options.environmentVariables;
            if (options.secrets)
                body.secrets = options.secrets;
            if (options.scheduleIntervalInSeconds)
                body.seconds = options.scheduleIntervalInSeconds;
            if (options.cronExpression)
                body.cron = options.cronExpression;
            if (options.registryCredentials)
                body.auth = options.registryCredentials;
            return yield this.post('/contract', body);
        });
        /**
         * Update an existing Smart Contract on your Dragonchain
         *
         * Note that all parameters (aside from contract id) are optional, and only supplied parameters will be updated
         */
        this.updateSmartContract = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.smartContractId)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `smartContractId` is required');
            if (options.scheduleIntervalInSeconds && options.cronExpression)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameters `scheduleIntervalInSeconds` and `cronExpression` are mutually exclusive');
            const body = {
                version: '3'
            };
            if (options.image)
                body.image = options.image;
            if (options.cmd)
                body.cmd = options.cmd;
            if (options.args)
                body.args = options.args;
            if (options.executionOrder)
                body.execution_order = options.executionOrder;
            if (options.enabled === true)
                body.desired_state = 'active';
            if (options.enabled === false)
                body.desired_state = 'inactive';
            if (options.environmentVariables)
                body.env = options.environmentVariables;
            if (options.secrets)
                body.secrets = options.secrets;
            if (options.scheduleIntervalInSeconds)
                body.seconds = options.scheduleIntervalInSeconds;
            if (options.cronExpression)
                body.cron = options.cronExpression;
            if (options.registryCredentials)
                body.auth = options.registryCredentials;
            return yield this.put(`/contract/${options.smartContractId}`, body);
        });
        /**
         * Deletes a deployed smart contract
         */
        this.deleteSmartContract = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.smartContractId)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `smartContractId` is required');
            return yield this.delete(`/contract/${options.smartContractId}`);
        });
        /**
         * Get a single smart contract by one of id or transaction type
         */
        this.getSmartContract = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (options.smartContractId && options.transactionType)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Only one of `smartContractId` or `transactionType` can be specified');
            if (options.smartContractId)
                return yield this.get(`/contract/${options.smartContractId}`);
            if (options.transactionType)
                return yield this.get(`/contract/txn_type/${options.transactionType}`);
            throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'At least one of `smartContractId` or `transactionType` must be supplied');
        });
        /**
         * Query smart contracts using ElasticSearch query-string syntax
         *
         * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
         * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
         * @example
         * ```javascript
         * myClient.querySmartContracts({ luceneQuery: 'tag:(bananas OR apples)' }).then( ...do stuff )
         * ```
         */
        this.querySmartContracts = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            const queryParams = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10);
            return yield this.get(`/contract${queryParams}`);
        });
        /**
         * Get verifications for a block. Note that this is only relevant for level 1 chains
         */
        this.getVerifications = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.blockId)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `blockId` is required');
            if (options.level) {
                return yield this.get(`/verifications/${options.blockId}?level=${options.level}`);
            }
            return yield this.get(`/verifications/${options.blockId}`);
        });
        /**
         * Get an object from the smart contract heap. This is used for getting stateful data set by the outputs of smart contracts
         */
        this.getSmartContractObject = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.key)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `key` is required');
            if (!options.smartContractId) {
                if (!process.env.SMART_CONTRACT_ID)
                    throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `smartContractId` is required when not running within a smart contract');
                options.smartContractId = process.env.SMART_CONTRACT_ID;
            }
            const response = yield this.get(`/get/${options.smartContractId}/${options.key}`, false);
            return response;
        });
        /**
         * List objects from a folder within the heap of a smart contract
         */
        this.listSmartContractObjects = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.smartContractId) {
                if (!process.env.SMART_CONTRACT_ID)
                    throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `smartContractId` is required when not running within a smart contract');
                options.smartContractId = process.env.SMART_CONTRACT_ID;
            }
            let path = `/list/${options.smartContractId}/`;
            if (options.prefixKey) {
                if (options.prefixKey.endsWith('/'))
                    throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `prefixKey` cannot end with \'/\'');
                path += options.prefixKey + '/';
            }
            return yield this.get(path);
        });
        /**
         * Create a new transaction type for ledgering transactions
         */
        this.createTransactionType = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.transactionType)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `transactionType` is required');
            const body = {
                version: '1',
                txn_type: options.transactionType
            };
            if (options.customIndexes)
                body.custom_indexes = options.customIndexes;
            return yield this.post('/transaction-type', body);
        });
        /**
         * Deletes an existing registered transaction type
         */
        this.deleteTransactionType = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.transactionType)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `transactionType` is required');
            return yield this.delete(`/transaction-type/${options.transactionType}`);
        });
        /**
         * Lists currently created transaction types
         */
        this.listTransactionTypes = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.get('/transaction-types');
        });
        /**
         * Updates an existing transaction type with new custom indexes
         */
        this.updateTransactionType = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.transactionType)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `transactionType` is required');
            if (!options.customIndexes)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `customIndexes` is required');
            const body = {
                version: '1',
                custom_indexes: options.customIndexes
            };
            return yield this.put(`/transaction-type/${options.transactionType}`, body);
        });
        /**
         * Gets an existing transaction type from the chain
         */
        this.getTransactionType = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.transactionType)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `transactionType` is required');
            return yield this.get(`/transaction-type/${options.transactionType}`);
        });
        /**
         * Gets a list of the chain's interchain addresses
         */
        this.getPublicBlockchainAddresses = () => tslib_1.__awaiter(this, void 0, void 0, function* () {
            return yield this.get('/public-blockchain-address');
        });
        this.createBitcoinTransaction = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.network)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `network` is required');
            const body = {
                network: options.network,
                transaction: {}
            };
            if (options.satoshisPerByte)
                body.transaction.fee = options.satoshisPerByte;
            if (options.data)
                body.transaction.data = options.data;
            if (options.changeAddress)
                body.transaction.change = options.changeAddress;
            if (options.outputs) {
                body.transaction.outputs = [];
                options.outputs.forEach(output => {
                    body.transaction.outputs.push({
                        to: output.scriptPubKey,
                        value: output.value
                    });
                });
            }
            return yield this.post('/public-blockchain-transaction', body);
        });
        this.createEthereumTransaction = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            if (!options.network)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `network` is required');
            if (!options.to)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `to` is required');
            if (!options.value)
                throw new FailureByDesign_1.FailureByDesign('BAD_REQUEST', 'Parameter `value` is required');
            const body = {
                network: options.network,
                transaction: {
                    to: options.to,
                    value: options.value
                }
            };
            if (options.data)
                body.transaction.data = options.data;
            if (options.gasPrice)
                body.transaction.data = options.gasPrice;
            if (options.gas)
                body.transaction.gas = options.gas;
            return yield this.post('/public-blockchain-transaction', body);
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
         * For development purposes only! NodeJS naturally distrusts self signed certs (for good reason!). This function allows users the option to "not care" about self signed certs.
         * @param {function} asyncFunction an async function to call while NODE_TLS_REJECT_UNAUTHORIZED is quickly toggled from "1" to "0" and back to "1"
         */
        this.toggleSslCertVerification = (asyncFunction) => tslib_1.__awaiter(this, void 0, void 0, function* () {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = (this.verify ? '1' : '0');
            const result = yield asyncFunction();
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
            return result;
        });
        this.endpoint = endpoint;
        this.verify = verify;
        this.credentialService = credentials;
        this.fetch = injected.fetch || node_fetch_1.default;
        this.readFileAsync = injected.readFileAsync || readFileAsync;
    }
    /**
     * @hidden
     */
    get(path, jsonParse = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            return this.makeRequest(path, 'GET', undefined, undefined, jsonParse);
        });
    }
    /**
     * @hidden
     */
    post(path, body, callbackURL) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
            return this.makeRequest(path, 'POST', callbackURL, bodyString);
        });
    }
    /**
     * @hidden
     */
    put(path, body) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
            return this.makeRequest(path, 'PUT', undefined, bodyString);
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
    getFetchOptions(path, method, callbackURL = '', body = '', contentType = '') {
        const timestamp = new Date().toISOString();
        const options = {
            method: method,
            body: body || undefined,
            headers: {
                dragonchain: this.credentialService.dragonchainId,
                Authorization: this.credentialService.getAuthorizationHeader(method, path, timestamp, contentType, body || ''),
                timestamp
            }
        };
        if (contentType)
            options.headers['Content-Type'] = contentType;
        if (callbackURL)
            options.headers['X-Callback-URL'] = callbackURL;
        return options;
    }
    /**
     * @hidden
     */
    makeRequest(path, method, callbackURL = '', body = '', jsonParse = true) {
        return tslib_1.__awaiter(this, void 0, void 0, function* () {
            let contentType = '';
            // assume content type is json if a body is provided, as it's the only content-type supported
            if (body)
                contentType = 'application/json';
            const fetchData = this.getFetchOptions(path, method, callbackURL, body, contentType);
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
exports.DragonchainClient = DragonchainClient;
/**
 * Create and return an instantiation of a dragonchain client
 */
exports.createClient = (options) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    if (!options.dragonchainId)
        options.dragonchainId = yield config_service_1.getDragonchainId();
    if (!options.endpoint)
        options.endpoint = yield config_service_1.getDragonchainEndpoint(options.dragonchainId);
    // Set defaults
    if (!options.algorithm)
        options.algorithm = 'SHA256';
    if (options.verify !== false)
        options.verify = true;
    const credentials = yield CredentialService_1.CredentialService.createCredentials(options.dragonchainId, options.authKey || '', options.authKeyId || '', options.algorithm);
    return new DragonchainClient(options.endpoint, credentials, options.verify);
});
/**
 * All Humans are welcome.
 */
