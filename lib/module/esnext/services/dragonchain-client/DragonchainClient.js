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
import { promisify } from 'util';
import { readFile } from 'fs';
import * as path from 'path';
import fetch from 'node-fetch';
import { CredentialService } from '../credential-service/CredentialService';
import { getDragonchainId, getDragonchainEndpoint } from '../config-service';
import { URLSearchParams as nodeUrlSearchParams } from 'url';
import { logger } from '../../index';
import { FailureByDesign } from '../../errors/FailureByDesign';
/**
 * @hidden
 */
let UrlSearchParams = (queryParams) => {
    if (!nodeUrlSearchParams) {
        // @ts-ignore
        return new URLSearchParams(queryParams); // used in browser ( method on window )
    }
    return new nodeUrlSearchParams(queryParams); // used in node
};
let readFileAsync = async () => '';
if (readFile)
    readFileAsync = promisify(readFile);
/**
 * HTTP Client that interfaces with the dragonchain api
 */
export class DragonchainClient {
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
        this.getSmartContractSecret = async (options) => {
            if (!options.secretName)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `secretName` is required');
            const secretPath = path.join('/', 'var', 'openfaas', 'secrets', `sc-${process.env.SMART_CONTRACT_ID}-${options.secretName}`);
            return await this.readFileAsync(secretPath, 'utf-8');
        };
        /**
         * Get the status of your dragonchain
         */
        this.getStatus = async () => await this.get('/status');
        /**
         * Get a transaction by id
         */
        this.getTransaction = async (options) => {
            if (!options.transactionId)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionId` is required');
            return await this.get(`/transaction/${options.transactionId}`);
        };
        /**
         * Generate a new HMAC API key
         */
        this.createApiKey = async () => {
            return await this.post('/api-key', {});
        };
        /**
         * List HMAC API key IDs and their associated metadata
         */
        this.listApiKeys = async () => {
            return await this.get('/api-key');
        };
        /**
         * Get metadata about an existing HMAC API key
         */
        this.getApiKey = async (options) => {
            if (!options.keyId)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `keyId` is required');
            return await this.get(`/api-key/${options.keyId}`);
        };
        /**
         * Delete an existing HMAC API key
         */
        this.deleteApiKey = async (options) => {
            if (!options.keyId)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `keyId` is required');
            return await this.delete(`/api-key/${options.keyId}`);
        };
        /**
         * Create a new Transaction on your Dragonchain.
         *
         * This transaction, if properly structured, will be received by your dragonchain, hashed, and put into a queue for processing into a block.
         *
         * A POST request is made to the callback URL when the transaction has settled into a block on the Blockchain.
         *
         * The `transaction_id` returned from this function can be used for checking the status of this transaction, including the block in which it was included.
         */
        this.createTransaction = async (options) => {
            if (!options.transactionType)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required');
            if (!options.payload)
                options.payload = ''; // default payload to an empty string if not provided
            const transactionBody = {
                version: '1',
                txn_type: options.transactionType,
                payload: options.payload
            };
            if (options.tag)
                transactionBody.tag = options.tag;
            return await this.post('/transaction', transactionBody, options.callbackURL);
        };
        /**
         * Create a bulk transaction to send many transactions to a chain with only a single call
         */
        this.createBulkTransaction = async (options) => {
            if (!options.transactionList)
                throw new FailureByDesign('PARAM_ERROR', 'parameter `transactionList` is required');
            let bulkTransactionBody = [];
            options.transactionList.forEach(transaction => {
                const singleBody = {
                    version: '1',
                    txn_type: transaction.transactionType,
                    payload: transaction.payload || ''
                };
                if (transaction.tag)
                    singleBody.tag = transaction.tag;
                bulkTransactionBody.push(singleBody);
            });
            return await this.post(`/transaction_bulk`, bulkTransactionBody);
        };
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
        this.queryTransactions = async (options = {}) => {
            const queryParams = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10);
            return await this.get(`/transaction${queryParams}`);
        };
        /**
         * Get a single block by ID
         */
        this.getBlock = async (options) => {
            if (!options.blockId)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `blockId` is required');
            return await this.get(`/block/${options.blockId}`);
        };
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
        this.queryBlocks = async (options = {}) => {
            const queryParams = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10);
            return await this.get(`/block${queryParams}`);
        };
        /**
         * Create a new Smart Contract on your Dragonchain
         */
        this.createSmartContract = async (options) => {
            if (!options.transactionType)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required');
            if (!options.image)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `image` is required');
            if (!options.cmd)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `cmd` is required');
            if (options.scheduleIntervalInSeconds && options.cronExpression)
                throw new FailureByDesign('PARAM_ERROR', 'Parameters `scheduleIntervalInSeconds` and `cronExpression` are mutually exclusive');
            const body = {
                version: '3',
                txn_type: options.transactionType,
                image: options.image,
                execution_order: 'parallel',
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
            return await this.post('/contract', body);
        };
        /**
         * Update an existing Smart Contract on your Dragonchain
         *
         * Note that all parameters (aside from contract id) are optional, and only supplied parameters will be updated
         */
        this.updateSmartContract = async (options) => {
            if (!options.smartContractId)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `smartContractId` is required');
            if (options.scheduleIntervalInSeconds && options.cronExpression)
                throw new FailureByDesign('PARAM_ERROR', 'Parameters `scheduleIntervalInSeconds` and `cronExpression` are mutually exclusive');
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
            return await this.put(`/contract/${options.smartContractId}`, body);
        };
        /**
         * Deletes a deployed smart contract
         */
        this.deleteSmartContract = async (options) => {
            if (!options.smartContractId)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `smartContractId` is required');
            return await this.delete(`/contract/${options.smartContractId}`);
        };
        /**
         * Get a single smart contract by one of id or transaction type
         */
        this.getSmartContract = async (options) => {
            if (options.smartContractId && options.transactionType)
                throw new FailureByDesign('PARAM_ERROR', 'Only one of `smartContractId` or `transactionType` can be specified');
            if (options.smartContractId)
                return await this.get(`/contract/${options.smartContractId}`);
            if (options.transactionType)
                return await this.get(`/contract/txn_type/${options.transactionType}`);
            throw new FailureByDesign('PARAM_ERROR', 'At least one of `smartContractId` or `transactionType` must be supplied');
        };
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
        this.querySmartContracts = async (options = {}) => {
            const queryParams = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10);
            return await this.get(`/contract${queryParams}`);
        };
        /**
         * Get verifications for a block. Note that this is only relevant for level 1 chains
         */
        this.getVerifications = async (options) => {
            if (!options.blockId)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `blockId` is required');
            if (options.level) {
                return await this.get(`/verifications/${options.blockId}?level=${options.level}`);
            }
            return await this.get(`/verifications/${options.blockId}`);
        };
        /**
         * Get an object from the smart contract heap. This is used for getting stateful data set by the outputs of smart contracts
         */
        this.getSmartContractObject = async (options) => {
            if (!options.key)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `key` is required');
            if (!options.smartContractId) {
                if (!process.env.SMART_CONTRACT_ID)
                    throw new FailureByDesign('PARAM_ERROR', 'Parameter `smartContractId` is required when not running within a smart contract');
                options.smartContractId = process.env.SMART_CONTRACT_ID;
            }
            const response = await this.get(`/get/${options.smartContractId}/${options.key}`, false);
            return response;
        };
        /**
         * List objects from a folder within the heap of a smart contract
         */
        this.listSmartContractObjects = async (options = {}) => {
            if (!options.smartContractId) {
                if (!process.env.SMART_CONTRACT_ID)
                    throw new FailureByDesign('PARAM_ERROR', 'Parameter `smartContractId` is required when not running within a smart contract');
                options.smartContractId = process.env.SMART_CONTRACT_ID;
            }
            let path = `/list/${options.smartContractId}/`;
            if (options.prefixKey) {
                if (options.prefixKey.endsWith('/'))
                    throw new FailureByDesign('PARAM_ERROR', 'Parameter `prefixKey` cannot end with \'/\'');
                path += `${options.prefixKey}/`;
            }
            return await this.get(path);
        };
        /**
         * Create a new transaction type for ledgering transactions
         */
        this.createTransactionType = async (options) => {
            if (!options.transactionType)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required');
            const body = {
                version: '1',
                txn_type: options.transactionType
            };
            if (options.customIndexes)
                body.custom_indexes = options.customIndexes;
            return await this.post('/transaction-type', body);
        };
        /**
         * Deletes an existing registered transaction type
         */
        this.deleteTransactionType = async (options) => {
            if (!options.transactionType)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required');
            return await this.delete(`/transaction-type/${options.transactionType}`);
        };
        /**
         * Lists currently created transaction types
         */
        this.listTransactionTypes = async () => {
            return await this.get('/transaction-types');
        };
        /**
         * Updates an existing transaction type with new custom indexes
         */
        this.updateTransactionType = async (options) => {
            if (!options.transactionType)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required');
            if (!options.customIndexes)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `customIndexes` is required');
            const body = {
                version: '1',
                custom_indexes: options.customIndexes
            };
            return await this.put(`/transaction-type/${options.transactionType}`, body);
        };
        /**
         * Gets an existing transaction type from the chain
         */
        this.getTransactionType = async (options) => {
            if (!options.transactionType)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required');
            return await this.get(`/transaction-type/${options.transactionType}`);
        };
        /**
         * Gets a list of the chain's interchain addresses
         */
        this.getPublicBlockchainAddresses = async () => {
            return await this.get('/public-blockchain-address');
        };
        this.createBitcoinTransaction = async (options) => {
            if (!options.network)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `network` is required');
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
            return await this.post('/public-blockchain-transaction', body);
        };
        this.createEthereumTransaction = async (options) => {
            if (!options.network)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `network` is required');
            if (!options.to)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `to` is required');
            if (!options.value)
                throw new FailureByDesign('PARAM_ERROR', 'Parameter `value` is required');
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
                body.transaction.gasPrice = options.gasPrice;
            if (options.gas)
                body.transaction.gas = options.gas;
            return await this.post('/public-blockchain-transaction', body);
        };
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
            // @ts-ignore
            const params = UrlSearchParams(queryObject);
            const queryString = `${query}${params}`;
            return queryString;
        };
        /**
         * @hidden
         * For development purposes only! NodeJS naturally distrusts self signed certs (for good reason!). This function allows users the option to "not care" about self signed certs.
         * @param {function} asyncFunction an async function to call while NODE_TLS_REJECT_UNAUTHORIZED is quickly toggled from "1" to "0" and back to "1"
         */
        this.toggleSslCertVerification = async (asyncFunction) => {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = (this.verify ? '1' : '0');
            const result = await asyncFunction();
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1';
            return result;
        };
        this.endpoint = endpoint;
        this.verify = verify;
        this.credentialService = credentials;
        this.fetch = injected.fetch || fetch;
        this.readFileAsync = injected.readFileAsync || readFileAsync;
    }
    /**
     * @hidden
     */
    async get(path, jsonParse = true) {
        return this.makeRequest(path, 'GET', undefined, undefined, jsonParse);
    }
    /**
     * @hidden
     */
    async post(path, body, callbackURL) {
        const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        return this.makeRequest(path, 'POST', callbackURL, bodyString);
    }
    /**
     * @hidden
     */
    async put(path, body) {
        const bodyString = typeof body === 'string' ? body : JSON.stringify(body);
        return this.makeRequest(path, 'PUT', undefined, bodyString);
    }
    /**
     * @hidden
     */
    async delete(path) {
        return this.makeRequest(path, 'DELETE');
    }
    /**
     * @hidden
     */
    getFetchOptions(path, method, callbackURL = '', body = '', contentType = '') {
        const timestamp = new Date().toISOString();
        const options = {
            method: method,
            body: body || undefined,
            credentials: 'omit',
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
    async makeRequest(path, method, callbackURL = '', body = '', jsonParse = true) {
        let contentType = '';
        // assume content type is json if a body is provided, as it's the only content-type supported
        if (body)
            contentType = 'application/json';
        const fetchData = this.getFetchOptions(path, method, callbackURL, body, contentType);
        const url = `${this.endpoint}${path}`;
        logger.debug(`[DragonchainClient][FETCH][URL] ==> ${url}`);
        logger.debug(`[DragonchainClient][FETCH][DATA] ==> ${JSON.stringify(fetchData)}`);
        // TODO: Use a custom https agent with fetch to properly ignore invalid HTTPS certs without an env var race condition
        const res = await this.toggleSslCertVerification(async () => this.fetch(url, fetchData));
        const { status, ok, statusText } = res;
        logger.debug(`[DragonchainClient][${method}] <== ${url} ${status} ${statusText}`);
        const response = await (jsonParse ? res.json() : res.text());
        logger.debug(`[DragonchainClient][${method}] <== ${JSON.stringify(response)}`);
        return { status, response, ok };
    }
}
/**
 * Create and return an instantiation of a dragonchain client
 */
export const createClient = async (options = {}) => {
    if (!options.dragonchainId)
        options.dragonchainId = await getDragonchainId();
    if (!options.endpoint)
        options.endpoint = await getDragonchainEndpoint(options.dragonchainId);
    // Set defaults
    if (!options.algorithm)
        options.algorithm = 'SHA256';
    if (options.verify !== false)
        options.verify = true;
    const credentials = await CredentialService.createCredentials(options.dragonchainId, options.authKey || '', options.authKeyId || '', options.algorithm);
    return new DragonchainClient(options.endpoint, credentials, options.verify);
};
/**
 * All Humans are welcome.
 */
