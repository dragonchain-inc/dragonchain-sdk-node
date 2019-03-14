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
import { DragonchainTransactionCreatePayload, L1DragonchainTransactionFull, DragonchainTransactionCreateResponse, SmartContractAtRest, ContractCreationSchema, L1DragonchainTransactionQueryResult, DragonchainContractCreateResponse, L1DragonchainStatusResult, SmartContractType, DragonchainBlockQueryResult, DragonchainBulkTransactions, Response, Verifications, levelVerifications, DragonnetConfigSchema, UpdateResponse, TransactionTypeStructure, TransactionTypeResponse, CustomIndexStructure } from 'src/interfaces/DragonchainClientInterfaces';
/**
 * HTTP Client that interfaces with the dragonchain api, using credentials stored on your machine.
 * @class DragonchainClient
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
    private readFileSync;
    /**
     * Create an Instance of a DragonchainClient.
     * @param dragonchainId id of a target dragonchain
     * @param verify verify SSL Certs when talking to local dragonchains
     * @param injected used only for testing
     */
    constructor(dragonchainId?: string, verify?: boolean, injected?: any);
    /**
     * Checks if a smart contract type string is valid
     * @hidden
     * @static
     * @name isValidSmartContractType
     * @param {SmartContractType} smartContractType smartContractType to validate
     * @returns {boolean} true if smart contract type is valid, false if not
     */
    static isValidSmartContractType: (smartContractType: SmartContractType) => boolean;
    /**
     * This method is used to override this SDK's attempt to automatically fetch credentials automatically with manually specified creds
     *
     * @param {string} authKeyId Auth Key ID used in HMAC
     * @param {string} authKey Auth Key used in HMAC
     */
    overrideCredentials: (authKeyId: string, authKey: string) => void;
    /**
     * Change the dragonchainId for this DragonchainClient instance.
     *
     * After using this command, subsequent requests to your dragonchain will attempt to re-locate credentials for the new dragonchain
     * @param dragonchainId The id of the dragonchain you want to set
     * @param setEndpoint Whether or not to set a new endpoint automatically (for managed chains at .api.dragonchain.com)
     */
    setDragonchainId: (dragonchainId: string, setEndpoint?: boolean) => void;
    /**
     * Change the endpoint for this DragonchainClient instance.
     *
     * @param endpoint The endpoint of the dragonchain you want to set
     */
    setEndpoint: (endpoint: string) => void;
    /**
     * Reads secrets given to a smart contract
     *
     * @param secretName the name of the secret to retrieve for smart contract
     */
    getSecret: (secretName: string) => string;
    /**
     * Get a transaction by Id.
     * @param transactionId The transaction id you are looking for.
     */
    getTransaction: (transactionId: string) => Promise<Response<L1DragonchainTransactionFull>>;
    /**
     * Query transactions using ElasticSearch query-string syntax
     * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
     * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
     * @example
     * ```javascript
     * myClient.queryTransactions('tag:(bananas OR apples)').then( ...do stuff )
     * ```
     */
    queryTransactions: (luceneQuery?: string | undefined, sort?: string | undefined, offset?: number, limit?: number) => Promise<Response<L1DragonchainTransactionQueryResult>>;
    /**
     * get the status of your dragonchain
     */
    getStatus: () => Promise<Response<L1DragonchainStatusResult>>;
    /**
     * Get a single block by ID
     */
    getBlock: (blockId: string) => Promise<Response<L1DragonchainTransactionFull>>;
    /**
     * Query blocks using ElasticSearch query-string syntax
     * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
     * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
     * @example
     * ```javascript
     * myClient.queryBlocks('tag:(bananas OR apples)').then( ...do stuff )
     * ```
     */
    queryBlocks: (luceneQuery?: string | undefined, sort?: string | undefined, offset?: number, limit?: number) => Promise<Response<DragonchainBlockQueryResult>>;
    /**
     * Get a single smart contract by name
     */
    getSmartContract: (contractName: string) => Promise<Response<SmartContractAtRest>>;
    /**
     * Query smart contracts using ElasticSearch query-string syntax
     * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
     * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
     * @example
     * ```javascript
     * myClient.querySmartContracts('tag:(bananas OR apples)').then( ...do stuff )
     * ```
     */
    querySmartContracts: (luceneQuery?: string | undefined, sort?: string | undefined, offset?: number, limit?: number) => Promise<Response<SmartContractAtRest>>;
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
    updateSmartContract: (contractId: string, image?: string | undefined, cmd?: string | undefined, executionOrder?: "parallel" | "serial" | undefined, desiredState?: "active" | "inactive" | undefined, args?: string[] | undefined, env?: {} | undefined, secrets?: {} | undefined, seconds?: number | undefined, cron?: string | undefined, auth?: string | undefined) => Promise<Response<UpdateResponse>>;
    /**
     * Deletes a smart contract
     * @param {string} txnType
     * @returns {Promise<UpdateResponse>} success message upon successful update
     */
    deleteSmartContract: (txnType: string) => Promise<Response<UpdateResponse>>;
    /**
     * Update your matchmaking data. If you are a level 2-4, you're required to update your asking price.
     * @param {number} askingPrice (0.0001-1000.0000) the price in DRGN to charge L1 nodes for your verification of their data. Setting this number too high will cause L1's to ignore you more often.
     * @param {number} broadcastInterval Broadcast Interval is only for level 5 chains
     */
    updateMatchmakingConfig: (askingPrice?: number | undefined, broadcastInterval?: number | undefined) => Promise<Response<UpdateResponse>>;
    /**
     * Update your maximum price for each level of verification.
     * This method is only relevant for L1 nodes.
     * @param {DragonnetConfigSchema} maximumPrices maximum prices (0-1000) to set for each level (in DRGNs) If this number is too low, other nodes will not verify your blocks. Changing this number will affect older unverified blocks first.
     */
    updateDragonnetConfig: (maximumPrices: DragonnetConfigSchema) => Promise<Response<UpdateResponse>>;
    /**
     * Create a new Transaction on your Dragonchain.
     * This transaction, if properly structured, will be received by your dragonchain, hashed, and put into a queue for processing into a block.
     * The `transaction_id` returned from this function can be used for checking the status of this transaction.
     * Most importantly; the block in which it has been fixated.
     *
     * @param {DragonchainTransactionCreatePayload} transactionObject
     * @returns {Promise<DragonchainTransactionCreateResponse>}
     */
    createTransaction: (transactionObject: DragonchainTransactionCreatePayload) => Promise<Response<DragonchainTransactionCreateResponse>>;
    /**
     * Create a bulk transaction by string together a bunch of transactions as JSON objects into an array
     * @param {DragonchainBulkTransactions} transactionBulkObject array of transactions
     * @return {Promise<DragonchainTransactionCreateResponse>}
     */
    createBulkTransaction: (transactionBulkObject: DragonchainBulkTransactions) => Promise<Response<DragonchainTransactionCreateResponse>>;
    /**
     * Create a new Smart Contract on your Dragonchain.
     * @returns {Promise<DragonchainContractCreateResponse>}
     */
    createContract: (body: ContractCreationSchema) => Promise<Response<DragonchainContractCreateResponse>>;
    /**
     * Get all the verifications for one block_id.
     * @param {string} block_id
     * @param {number} level
     */
    getVerifications: (blockId: string, level?: number) => Promise<Response<levelVerifications> | Response<Verifications>>;
    /**
     * getSmartContractHeap
     * Get from the smart contract heap
     * This function, (unlike other SDK methods) returns raw utf-8 text by design.
     * If you expect the result to be parsed json pass `true` as the jsonParse parameter.
     * @param {string} key the key under which data has been stored in heap
     * @param {string} scName the name of smart contract
     * @param {boolean} jsonParse attempt to parse heap data as JSON. Throws JSONParse error if it fails.
     */
    getSmartContractHeap: (key: string, scName: string, jsonParse?: boolean) => Promise<Response<string>>;
    /**
     * listSmartcontractHeap
     * List objects from a smart contract heap
     * @param {string} scName the name of smart contract
     * @param {string} key the sub-key ('folder') to list in the SC heap (optional. Defaults to root of SC heap)
     */
    listSmartcontractHeap: (scName: string, key?: string) => Promise<Response<string[]>>;
    /**
     * registerTransactionType
     * Registers a new transaction type
     * @param {TransactionTypeStructure} txnTypeStructure
     */
    registerTransactionType: (txnTypeStructure: TransactionTypeStructure) => Promise<Response<UpdateResponse>>;
    /**
     * deleteTransactionType
     * Deletes existing registered transaction type
     * @param {string} transactionType
     */
    deleteTransactionType: (transactionType: string) => Promise<Response<UpdateResponse>>;
    /**
     * listTransactionTypes
     * Lists current accepted transaction types for a chain
     */
    listTransactionTypes: () => Promise<Response<TransactionTypeResponse[]>>;
    /**
     * updateTransactionType
     * Updates a given transaction type structure
     * @param {string} transactionType
     * @param {CustomIndexStructure} customIndexes
     */
    updateTransactionType: (transactionType: string, customIndexes: CustomIndexStructure[]) => Promise<Response<UpdateResponse>>;
    /**
     * @hidden
     * getTransactionType
     * Gets a specific transaction type
     * @param {string} transactionType
     */
    getTransactionType: (transactionType: string) => Promise<Response<TransactionTypeResponse>>;
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
     * @name toggleSslCertVerification
     * @description For development purposes only! NodeJS naturally distrusts self signed certs (for good reason!). This function allows users the option to "not care" about self signed certs.
     * @param {function} asyncFunction an async function to call while NODE_TLS_REJECT_UNAUTHORIZED is quickly toggled from "1" to "0" and back to "1"
     */
    private toggleSslCertVerification;
    /**
     * @hidden
     */
    private makeRequest;
}
/**
 * All Humans are welcome.
 */
