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
import { L1DragonchainTransactionFull, DragonchainTransactionCreateResponse, DragonchainBulkTransactionCreateResponse, SmartContractAtRest, DragonchainContractCreateResponse, L1DragonchainStatusResult, Response, QueryResult, BlockSchemaType, Verifications, levelVerifications, TransactionTypeResponse, PublicBlockchainTransactionResponse, PublicBlockchainAddressListResponse, TransactionTypeSimpleResponse, TransactionTypeListResponse, TransactionTypeCustomIndex, BitcoinTransactionOutputs, BulkTransactionPayload, ListAPIKeyResponse, CreateAPIKeyResponse, GetAPIKeyResponse, DeleteAPIKeyResponse } from '../../interfaces/DragonchainClientInterfaces';
import { CredentialService } from '../credential-service/CredentialService';
/**
 * HTTP Client that interfaces with the dragonchain api
 */
export declare class DragonchainClient {
    /**
     * @hidden
     */
    private endpoint;
    /**
     * @hidden
     */
    private verify;
    /**
     * @hidden
     */
    private credentialService;
    /**
     * @hidden
     */
    private fetch;
    /**
     * @hidden
     */
    private readFileAsync;
    /**
     * @hidden
     * Construct an instance of a DragonchainClient. THIS SHOULD NOT BE CALLED DIRECTLY. Instead use the `createClient` function to instantiate a client
     */
    constructor(endpoint: string, credentials: CredentialService, verify: boolean, injected?: any);
    /**
     * Reads secrets provided to a smart contract
     *
     * Note: This will only work when running within a smart contract, given that the smart contract was created/updated with secrets
     */
    getSmartContractSecret: (options: {
        /**
         * the name of the secret to retrieve for smart contract
         */
        secretName: string;
    }) => Promise<string>;
    /**
     * Get the status of your dragonchain
     */
    getStatus: () => Promise<Response<L1DragonchainStatusResult>>;
    /**
     * Get a transaction by id
     */
    getTransaction: (options: {
        /**
         * the transaction id of the transaction to get
         */
        transactionId: string;
    }) => Promise<Response<L1DragonchainTransactionFull>>;
    /**
     * Generate a new HMAC API key
     */
    createApiKey: () => Promise<Response<CreateAPIKeyResponse>>;
    /**
     * List HMAC API key IDs and their associated metadata
     */
    listApiKeys: () => Promise<Response<ListAPIKeyResponse>>;
    /**
     * Get metadata about an existing HMAC API key
     */
    getApiKey: (options: {
        /**
         * the key id of the key to get
         */
        keyId: string;
    }) => Promise<Response<GetAPIKeyResponse>>;
    /**
     * Delete an existing HMAC API key
     */
    deleteApiKey: (options: {
        /**
         * the key id of the key to delete
         */
        keyId: string;
    }) => Promise<Response<DeleteAPIKeyResponse>>;
    /**
     * Create a new Transaction on your Dragonchain.
     *
     * This transaction, if properly structured, will be received by your dragonchain, hashed, and put into a queue for processing into a block.
     *
     * A POST request is made to the callback URL when the transaction has settled into a block on the Blockchain.
     *
     * The `transaction_id` returned from this function can be used for checking the status of this transaction, including the block in which it was included.
     */
    createTransaction: (options: {
        /**
         * The transaction type to use for this new transaction. This transaction type must already exist on the chain (via `createTransactionType`)
         */
        transactionType: string;
        /**
         * Payload of the transaction. Must be a utf-8 encodable string, or any json object
         */
        payload?: string | object | undefined;
        /**
         * Tag of the transaction which gets indexed and can be searched on for queries
         */
        tag?: string | undefined;
        /**
         * URL to callback when this transaction is processed
         */
        callbackURL?: string | undefined;
    }) => Promise<Response<DragonchainTransactionCreateResponse>>;
    /**
     * Create a bulk transaction to send many transactions to a chain with only a single call
     */
    createBulkTransaction: (options: {
        transactionList: BulkTransactionPayload[];
    }) => Promise<Response<DragonchainBulkTransactionCreateResponse>>;
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
    queryTransactions: (options?: {
        /**
         * lucene query to use for this query request
         * @example `is_serial:true`
         */
        luceneQuery?: string | undefined;
        /**
         * Sort syntax of 'field:direction'
         * @example `txn_type:asc`
         */
        sort?: string | undefined;
        /**
         * Pagination offset integer of query (default 0)
         */
        offset?: number | undefined;
        /**
         * Pagination limit integer of query (default 10)
         */
        limit?: number | undefined;
    }) => Promise<Response<QueryResult<L1DragonchainTransactionFull>>>;
    /**
     * Get a single block by ID
     */
    getBlock: (options: {
        /**
         * ID of the block to fetch
         */
        blockId: string;
    }) => Promise<Response<BlockSchemaType>>;
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
    queryBlocks: (options?: {
        /**
         * lucene query to use for this query request
         * @example `is_serial:true`
         */
        luceneQuery?: string | undefined;
        /**
         * Sort syntax of 'field:direction'
         * @example `block_id:asc`
         */
        sort?: string | undefined;
        /**
         * Pagination offset integer of query (default 0)
         */
        offset?: number | undefined;
        /**
         * Pagination limit integer of query (default 10)
         */
        limit?: number | undefined;
    }) => Promise<Response<QueryResult<BlockSchemaType>>>;
    /**
     * Create a new Smart Contract on your Dragonchain
     */
    createSmartContract: (options: {
        /**
         * Transaction type to assign to this new smart contract
         *
         * Must not already exist as a transaction type on the chain
         */
        transactionType: string;
        /**
         * Docker image to use with the smart contract. Should be in the form registry/image:tag (or just image:tag if it's a docker hub image)
         * @example quay.io/coreos/awscli:latest
         * @example alpine:3.9
         */
        image: string;
        /**
         * The command to run in your docker container for your application
         * @example echo
         */
        cmd: string;
        /**
         * The list of arguments to use in conjunction with cmd
         * @example ['input', 'that', 'will', 'be', 'passed', 'in', 'as', 'args', 'to', 'cmd']
         */
        args?: string[] | undefined;
        /**
         * The execution of the smart contract, can be `serial` or `parallel`. Will default to `parallel`
         *
         * If running in serial, the contract will be queued and executed in order, only one at a time
         *
         * If running in parallel, the contract will be executed as soon as possible after invocation, potentially out of order, and many at a time
         */
        executionOrder?: "parallel" | "serial" | undefined;
        /**
         * JSON object key-value pairs of strings for environments variables provided to the smart contract on execution
         * @example
         * ```javascript
         *
         * { MY_CUSTOM_ENV_VAR: "my_custom_env_value" }
         * ```
         */
        environmentVariables?: object | undefined;
        /**
         * JSON object key-value pairs of strings for secrets provided to the smart contract on execution
         *
         * These are more securely stored than environment variables, and can be accessed during execution the smart contract by using the `getSmartContractSecret` method of the sdk
         * @example
         * ```javascript
         *
         * { MY_SECRET: "some secret special data" }
         * ```
         */
        secrets?: object | undefined;
        /**
         * Schedule a smart contract to be automatically executed every `x` seconds
         *
         * For example: if `10` is supplied, then this contract will be automatically invoked and create a transaction once every 10 seconds
         *
         * This value should be a whole integer, and not a decimal
         *
         * Note: This is a mutually exclusive parameter with cronExpression
         */
        scheduleIntervalInSeconds?: number | undefined;
        /**
         * Schedule a smart contract to be automatically executed on a cadence via a cron expression
         *
         * Note: This is a mutually exclusive parameter with scheduleIntervalInSeconds
         * @example `* * * * *` This will invoke the contract automatically every minute, on the minute
         */
        cronExpression?: string | undefined;
        /**
         * The basic-auth credentials necessary to pull the docker container.
         *
         * This should be a base64-encoded string of `username:password` for the docker registry
         * @example ZXhhbXBsZVVzZXI6ZXhhbXBsZVBhc3N3b3JkCg==
         */
        registryCredentials?: string | undefined;
    }) => Promise<Response<DragonchainContractCreateResponse>>;
    /**
     * Update an existing Smart Contract on your Dragonchain
     *
     * Note that all parameters (aside from contract id) are optional, and only supplied parameters will be updated
     */
    updateSmartContract: (options: {
        /**
         * Smart contract id of which to update. Should be a guid
         */
        smartContractId: string;
        /**
         * Docker image to use with the smart contract. Should be in the form registry/image:tag (or just image:tag if it's a docker hub image)
         * @example quay.io/coreos/awscli:latest
         * @example alpine:3.9
         */
        image?: string | undefined;
        /**
         * The command to run in your docker container for your application
         * @example echo
         */
        cmd?: string | undefined;
        /**
         * The list of arguments to use in conjunction with cmd
         * @example ['input', 'that', 'will', 'be', 'passed', 'in', 'as', 'args', 'to', 'cmd']
         */
        args?: string[] | undefined;
        /**
         * The execution of the smart contract, can be `serial` or `parallel`. Will default to `parallel`
         *
         * If running in serial, the contract will be queued and executed in order, only one at a time
         *
         * If running in parallel, the contract will be executed as soon as possible after invocation, potentially out of order, and many at a time
         */
        executionOrder?: "parallel" | "serial" | undefined;
        /**
         * Boolean whether or not the contract should be enabled, and able to be invoked
         */
        enabled?: boolean | undefined;
        /**
         * JSON object key-value pairs of strings for environments variables provided to the smart contract on execution
         * @example
         * ```javascript
         *
         * { MY_CUSTOM_ENV_VAR: "my_custom_env_value" }
         * ```
         */
        environmentVariables?: object | undefined;
        /**
         * JSON object key-value pairs of strings for secrets provided to the smart contract on execution
         *
         * These are more securely stored than environment variables, and can be accessed during execution the smart contract by using the `getSmartContractSecret` method of the sdk
         * @example
         * ```javascript
         *
         * { MY_SECRET: "some secret special data" }
         * ```
         */
        secrets?: object | undefined;
        /**
         * Schedule a smart contract to be automatically executed every `x` seconds
         *
         * For example, if `10` is supplied, then this contract will be automatically invoked and create a transaction once every 10 seconds
         *
         * This value should be a whole integer, and not a decimal
         *
         * Note: This is a mutually exclusive parameter with cronExpression
         */
        scheduleIntervalInSeconds?: number | undefined;
        /**
         * Schedule a smart contract to be automatically executed on a cadence via a cron expression
         *
         * Note: This is a mutually exclusive parameter with scheduleIntervalInSeconds
         *
         * @example `* * * * *` This will invoke the contract automatically every minute, on the minute
         */
        cronExpression?: string | undefined;
        /**
         * The basic-auth credentials necessary to pull the docker container.
         *
         * This should be a base64-encoded string of `username:password` for the docker registry
         *
         * @example ZXhhbXBsZVVzZXI6ZXhhbXBsZVBhc3N3b3JkCg==
         */
        registryCredentials?: string | undefined;
    }) => Promise<Response<DragonchainContractCreateResponse>>;
    /**
     * Deletes a deployed smart contract
     */
    deleteSmartContract: (options: {
        /**
         * The id of the smart contract to delete. Should be a guid
         */
        smartContractId: string;
    }) => Promise<Response<DragonchainContractCreateResponse>>;
    /**
     * Get a single smart contract by one of id or transaction type
     */
    getSmartContract: (options: {
        /**
         * Contract id to get, mutually exclusive with transactionType
         */
        smartContractId?: string | undefined;
        /**
         * Transaction id of smart contract to get, mutually exclusive with smartContractId
         */
        transactionType?: string | undefined;
    }) => Promise<Response<SmartContractAtRest>>;
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
    querySmartContracts: (options?: {
        /**
         * lucene query to use for this query request
         * @example `is_serial:true`
         */
        luceneQuery?: string | undefined;
        /**
         * Sort syntax of 'field:direction'
         * @example `txn_type:asc`
         */
        sort?: string | undefined;
        /**
         * Pagination offset integer of query (default 0)
         */
        offset?: number | undefined;
        /**
         * Pagination limit integer of query (default 10)
         */
        limit?: number | undefined;
    }) => Promise<Response<QueryResult<SmartContractAtRest>>>;
    /**
     * Get verifications for a block. Note that this is only relevant for level 1 chains
     */
    getVerifications: (options: {
        /**
         * The block ID to retrieve verifications for
         */
        blockId: string;
        /**
         * The level of verifications to retrieve (2-5). If not supplied, all levels are returned
         */
        level?: number | undefined;
    }) => Promise<Response<levelVerifications> | Response<Verifications>>;
    /**
     * Get an object from the smart contract heap. This is used for getting stateful data set by the outputs of smart contracts
     */
    getSmartContractObject: (options: {
        /**
         * Key of the object to retrieve
         */
        key: string;
        /**
         * Smart contract to get the object from
         *
         * When running from within a smart contract, this is provided via the SMART_CONTRACT_ID environment variable, and doesn't need to be explicitly provided
         */
        smartContractId?: string | undefined;
    }) => Promise<string>;
    /**
     * List objects from a folder within the heap of a smart contract
     */
    listSmartContractObjects: (options?: {
        /**
         * The folder to list from the heap. Please note this CANNOT end in a '/'
         *
         * If nothing is provided, it will list at the root of the heap
         * @example folder1
         * @example folder1/subFolder
         */
        prefixKey?: string | undefined;
        /**
         * Smart contract to list the objects from
         *
         * When running from within a smart contract, this is provided via the SMART_CONTRACT_ID environment variable, and doesn't need to be explicitly provided
         */
        smartContractId?: string | undefined;
    }) => Promise<Response<string[]>>;
    /**
     * Create a new transaction type for ledgering transactions
     */
    createTransactionType: (options: {
        /**
         * The string of the transaction type to create
         * @example cust1
         */
        transactionType: string;
        /**
         * The custom indexes that should be associated with this transaction type
         */
        customIndexes?: TransactionTypeCustomIndex[] | undefined;
    }) => Promise<Response<TransactionTypeSimpleResponse>>;
    /**
     * Deletes an existing registered transaction type
     */
    deleteTransactionType: (options: {
        /**
         * The name of the transaction type to delete
         */
        transactionType: string;
    }) => Promise<Response<TransactionTypeSimpleResponse>>;
    /**
     * Lists currently created transaction types
     */
    listTransactionTypes: () => Promise<Response<TransactionTypeListResponse>>;
    /**
     * Updates an existing transaction type with new custom indexes
     */
    updateTransactionType: (options: {
        /**
         * The name of the transaction type to update
         */
        transactionType: string;
        /**
         * The custom indexes that should be updated onto the transaction type
         */
        customIndexes: TransactionTypeCustomIndex[];
    }) => Promise<Response<TransactionTypeSimpleResponse>>;
    /**
     * Gets an existing transaction type from the chain
     */
    getTransactionType: (options: {
        /**
         * The name of the transaction type to get
         */
        transactionType: string;
    }) => Promise<Response<TransactionTypeResponse>>;
    /**
     * Gets a list of the chain's interchain addresses
     */
    getPublicBlockchainAddresses: () => Promise<Response<PublicBlockchainAddressListResponse>>;
    createBitcoinTransaction: (options: {
        /**
         * The bitcoin network that the transaction is for (mainnet or testnet)
         */
        network: "BTC_MAINNET" | "BTC_TESTNET3";
        /**
         * The desired fee in satoshis/byte
         *
         * If not supplied, an estimate will be automatically generated
         */
        satoshisPerByte?: number | undefined;
        /**
         * String data to embed in the transaction as null-data output type
         */
        data?: string | undefined;
        /**
         * Change address to use for this transaction. If not supplied, this will be the source address
         */
        changeAddress?: string | undefined;
        /**
         * The desired bitcoin outputs to create for this transaction
         */
        outputs?: BitcoinTransactionOutputs[] | undefined;
    }) => Promise<Response<PublicBlockchainTransactionResponse>>;
    createEthereumTransaction: (options: {
        /**
         * The ethereum network that the transaction is for (ETH/ETC mainnet or testnet)
         */
        network: "ETH_MAINNET" | "ETH_ROPSTEN" | "ETC_MAINNET" | "ETC_MORDEN";
        /**
         * The (hex-encoded) address to send the transaction to
         */
        to: string;
        /**
         * The (hex-encoded) number of wei to send with this transaction
         */
        value: string;
        /**
         * The (hex-encoded) string of extra data to include with this transaction
         */
        data?: string | undefined;
        /**
         * The (hex-encoded) gas price in gwei to pay. If not supplied, this will be estimated automatically
         */
        gasPrice?: string | undefined;
        /**
         * The (hex-encoded) gas limit for this transaction. If not supplied, this will be estimated automatically
         */
        gas?: string | undefined;
    }) => Promise<Response<PublicBlockchainTransactionResponse>>;
    /**
     * @hidden
     */
    private getLuceneParams;
    /**
     * @hidden
     */
    private generateQueryString;
    /**
     * @hidden
     */
    private get;
    /**
     * @hidden
     */
    private post;
    /**
     * @hidden
     */
    private put;
    /**
     * @hidden
     */
    private delete;
    /**
     * @hidden
     */
    private getFetchOptions;
    /**
     * @hidden
     * For development purposes only! NodeJS naturally distrusts self signed certs (for good reason!). This function allows users the option to "not care" about self signed certs.
     * @param {function} asyncFunction an async function to call while NODE_TLS_REJECT_UNAUTHORIZED is quickly toggled from "1" to "0" and back to "1"
     */
    private toggleSslCertVerification;
    /**
     * @hidden
     */
    private makeRequest;
}
/**
 * Create and return an instantiation of a dragonchain client
 */
export declare const createClient: (options?: {
    /**
     * DragonchainId for this client. Not necessary if DRAGONCHAIN_ID env var is set, or if default is set in config file
     */
    dragonchainId?: string | undefined;
    /**
     * AuthKeyId to explicitly use with this client. Must be set along with authKey or it will be ignored
     */
    authKeyId?: string | undefined;
    /**
     * AuthKey to explicitly use with this client. Must be set along with authKeyId or it will be ignored
     */
    authKey?: string | undefined;
    /**
     * Endpoint to explicitly use with this client. Should not have a trailing slash and look something like https://some.url
     */
    endpoint?: string | undefined;
    /**
     * Whether or not to verify the https certificate for https connections. Defaults to true if not provided
     */
    verify?: boolean | undefined;
    /**
     * The hmac algorithm to use when generating authenticated requests. Defaults to SHA256
     */
    algorithm?: "SHA256" | "SHA3-256" | "BLAKE2b512" | undefined;
}) => Promise<DragonchainClient>;
/**
 * All Humans are welcome.
 */
