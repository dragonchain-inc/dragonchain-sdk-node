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

import { promisify } from 'util'
import { readFile } from 'fs'
import * as path from 'path'
import fetch from 'node-fetch'
import {
  L1DragonchainTransactionFull,
  DragonchainTransactionCreateResponse,
  DragonchainBulkTransactionCreateResponse,
  SmartContractAtRest,
  DragonchainContractCreateResponse,
  SupportedHTTP,
  FetchOptions,
  L1DragonchainStatusResult,
  Response,
  QueryResult,
  BlockSchemaType,
  Verifications,
  levelVerifications,
  TransactionTypeResponse,
  PublicBlockchainTransactionResponse,
  PublicBlockchainAddressListResponse,
  SmartContractExecutionOrder,
  SimpleResponse,
  TransactionTypeListResponse,
  TransactionTypeCustomIndex,
  BitcoinTransactionOutputs,
  BulkTransactionPayload,
  ListAPIKeyResponse,
  CreateAPIKeyResponse,
  GetAPIKeyResponse,
  DeleteAPIKeyResponse
} from '../../interfaces/DragonchainClientInterfaces'
import { CredentialService, HmacAlgorithm } from '../credential-service/CredentialService'
import { getDragonchainId, getDragonchainEndpoint } from '../config-service'
import { URLSearchParams as nodeUrlSearchParams } from 'url'
import { logger } from '../../index'
import { FailureByDesign } from '../../errors/FailureByDesign'

/**
 * @hidden
 */

let UrlSearchParams: any = (queryParams: any) => {
  if (!nodeUrlSearchParams) {
    // @ts-ignore
    return new URLSearchParams(queryParams) // used in browser ( method on window )
  }
  return new nodeUrlSearchParams(queryParams) // used in node
}

let readFileAsync: any = async () => ''
if (readFile) readFileAsync = promisify(readFile)

/**
 * HTTP Client that interfaces with the dragonchain api
 */
export class DragonchainClient {
  /**
   * @hidden
   */
  private endpoint: string
  /**
   * @hidden
   */
  private verify: boolean
  /**
   * @hidden
   */
  private credentialService: CredentialService
  /**
   * @hidden
   */
  private fetch: any
  /**
   * @hidden
   */
  private readFileAsync: any

  /**
   * @hidden
   * Construct an instance of a DragonchainClient. THIS SHOULD NOT BE CALLED DIRECTLY. Instead use the `createClient` function to instantiate a client
   */
  constructor (
    endpoint: string,
    credentials: CredentialService,
    verify: boolean,
    injected: any = {}
  ) {
    this.endpoint = endpoint
    this.verify = verify
    this.credentialService = credentials
    this.fetch = injected.fetch || fetch
    this.readFileAsync = injected.readFileAsync || readFileAsync
  }

  /**
   * Reads secrets provided to a smart contract
   *
   * Note: This will only work when running within a smart contract, given that the smart contract was created/updated with secrets
   */
  public getSmartContractSecret = async (options: {
    /**
     * the name of the secret to retrieve for smart contract
     */
    secretName: string
  }) => {
    if (!options.secretName) throw new FailureByDesign('PARAM_ERROR', 'Parameter `secretName` is required')
    const secretPath = path.join('/', 'var', 'openfaas', 'secrets', `sc-${process.env.SMART_CONTRACT_ID}-${options.secretName}`)
    return await this.readFileAsync(secretPath, 'utf-8') as string
  }

  /**
   * Get the status of your dragonchain
   */
  public getStatus = async () => await this.get('/status') as Response<L1DragonchainStatusResult>

  /**
   * Get a transaction by id
   */
  public getTransaction = async (options: {
    /**
     * the transaction id of the transaction to get
     */
    transactionId: string
  }) => {
    if (!options.transactionId) throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionId` is required')
    return await this.get(`/transaction/${options.transactionId}`) as Response<L1DragonchainTransactionFull>
  }

  /**
   * Generate a new HMAC API key
   */
  public createApiKey = async (options: {
    nickname: string
  }) => {
    if (!options.nickname) throw new FailureByDesign('PARAM_ERROR', 'Parameter `nickname` is required')
    return await this.post('/api-key', { nickname: options.nickname }) as Response<CreateAPIKeyResponse>
  }

  /**
   * List HMAC API key IDs and their associated metadata
   */
  public listApiKeys = async () => {
    return await this.get('/api-key') as Response<ListAPIKeyResponse>
  }

  /**
   * Get metadata about an existing HMAC API key
   */
  public getApiKey = async (options: {
    /**
     * the key id of the key to get
     */
    keyId: string
  }) => {
    if (!options.keyId) throw new FailureByDesign('PARAM_ERROR', 'Parameter `keyId` is required')
    return await this.get(`/api-key/${options.keyId}`) as Response<GetAPIKeyResponse>
  }

  /**
   * Delete an existing HMAC API key
   */
  public deleteApiKey = async (options: {
    /**
     * the key id of the key to delete
     */
    keyId: string
  }) => {
    if (!options.keyId) throw new FailureByDesign('PARAM_ERROR', 'Parameter `keyId` is required')
    return await this.delete(`/api-key/${options.keyId}`) as Response<DeleteAPIKeyResponse>
  }

  /**
   * Update nickname of existing HMAC API key
   */
  public updateApiKey = async (options: {
    /**
     * Key ID to modify
     */
    keyId: string,
    /**
     * New nickname to set for key
     */
    nickname: string
  }) => {
    if (!options.keyId || !options.nickname) throw new FailureByDesign('PARAM_ERROR', 'Parameter `keyId` and `nickname` are required');
    return await this.put(`/api-key/${options.keyId}`, { nickname: options.nickname }) as Response<SimpleResponse>
  }

  /**
   * Create a new Transaction on your Dragonchain.
   *
   * This transaction, if properly structured, will be received by your dragonchain, hashed, and put into a queue for processing into a block.
   *
   * A POST request is made to the callback URL when the transaction has settled into a block on the Blockchain.
   *
   * The `transaction_id` returned from this function can be used for checking the status of this transaction, including the block in which it was included.
   */
  public createTransaction = async (options: {
    /**
     * The transaction type to use for this new transaction. This transaction type must already exist on the chain (via `createTransactionType`)
     */
    transactionType: string,
    /**
     * Payload of the transaction. Must be a utf-8 encodable string, or any json object
     */
    payload?: string | object,
    /**
     * Tag of the transaction which gets indexed and can be searched on for queries
     */
    tag?: string,
    /**
     * URL to callback when this transaction is processed
     */
    callbackURL?: string
  }) => {
    if (!options.transactionType) throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required')
    if (!options.payload) options.payload = '' // default payload to an empty string if not provided
    const transactionBody = {
      version: '1',
      txn_type: options.transactionType,
      payload: options.payload
    } as any
    if (options.tag) transactionBody.tag = options.tag
    return await this.post('/transaction', transactionBody, options.callbackURL) as Response<DragonchainTransactionCreateResponse>
  }

  /**
   * Create a bulk transaction to send many transactions to a chain with only a single call
   */
  public createBulkTransaction = async (options: {
    transactionList: BulkTransactionPayload[]
  }) => {
    if (!options.transactionList) throw new FailureByDesign('PARAM_ERROR', 'parameter `transactionList` is required')
    let bulkTransactionBody: any[] = []
    options.transactionList.forEach(transaction => {
      const singleBody: any = {
        version: '1',
        txn_type: transaction.transactionType,
        payload: transaction.payload || ''
      }
      if (transaction.tag) singleBody.tag = transaction.tag
      bulkTransactionBody.push(singleBody)
    })
    return await this.post(`/transaction_bulk`, bulkTransactionBody) as Response<DragonchainBulkTransactionCreateResponse>
  }

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
  public queryTransactions = async (options: {
    /**
     * lucene query to use for this query request
     * @example `is_serial:true`
     */
    luceneQuery?: string,
    /**
     * Sort syntax of 'field:direction'
     * @example `txn_type:asc`
     */
    sort?: string,
    /**
     * Pagination offset integer of query (default 0)
     */
    offset?: number,
    /**
     * Pagination limit integer of query (default 10)
     */
    limit?: number
  } = {}) => {
    const queryParams: string = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10)
    return await this.get(`/transaction${queryParams}`) as Response<QueryResult<L1DragonchainTransactionFull>>
  }

  /**
   * Get a single block by ID
   */
  public getBlock = async (options: {
    /**
     * ID of the block to fetch
     */
    blockId: string
  }) => {
    if (!options.blockId) throw new FailureByDesign('PARAM_ERROR', 'Parameter `blockId` is required')
    return await this.get(`/block/${options.blockId}`) as Response<BlockSchemaType>
  }

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
  public queryBlocks = async (options: {
    /**
     * lucene query to use for this query request
     * @example `is_serial:true`
     */
    luceneQuery?: string,
    /**
     * Sort syntax of 'field:direction'
     * @example `block_id:asc`
     */
    sort?: string,
    /**
     * Pagination offset integer of query (default 0)
     */
    offset?: number,
    /**
     * Pagination limit integer of query (default 10)
     */
    limit?: number
  } = {}) => {
    const queryParams: string = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10)
    return await this.get(`/block${queryParams}`) as Response<QueryResult<BlockSchemaType>>
  }

  /**
   * Create a new Smart Contract on your Dragonchain
   */
  public createSmartContract = async (options: {
    /**
     * Transaction type to assign to this new smart contract
     *
     * Must not already exist as a transaction type on the chain
     */
    transactionType: string,
    /**
     * Docker image to use with the smart contract. Should be in the form registry/image:tag (or just image:tag if it's a docker hub image)
     * @example quay.io/coreos/awscli:latest
     * @example alpine:3.9
     */
    image: string,
    /**
     * The command to run in your docker container for your application
     * @example echo
     */
    cmd: string,
    /**
     * The list of arguments to use in conjunction with cmd
     * @example ['input', 'that', 'will', 'be', 'passed', 'in', 'as', 'args', 'to', 'cmd']
     */
    args?: string[],
    /**
     * The execution of the smart contract, can be `serial` or `parallel`. Will default to `parallel`
     *
     * If running in serial, the contract will be queued and executed in order, only one at a time
     *
     * If running in parallel, the contract will be executed as soon as possible after invocation, potentially out of order, and many at a time
     */
    executionOrder?: SmartContractExecutionOrder,
    /**
     * JSON object key-value pairs of strings for environments variables provided to the smart contract on execution
     * @example
     * ```javascript
     *
     * { MY_CUSTOM_ENV_VAR: "my_custom_env_value" }
     * ```
     */
    environmentVariables?: object,
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
    secrets?: object,
    /**
     * Schedule a smart contract to be automatically executed every `x` seconds
     *
     * For example: if `10` is supplied, then this contract will be automatically invoked and create a transaction once every 10 seconds
     *
     * This value should be a whole integer, and not a decimal
     *
     * Note: This is a mutually exclusive parameter with cronExpression
     */
    scheduleIntervalInSeconds?: number,
    /**
     * Schedule a smart contract to be automatically executed on a cadence via a cron expression
     *
     * Note: This is a mutually exclusive parameter with scheduleIntervalInSeconds
     * @example `* * * * *` This will invoke the contract automatically every minute, on the minute
     */
    cronExpression?: string,
    /**
     * The basic-auth credentials necessary to pull the docker container.
     *
     * This should be a base64-encoded string of `username:password` for the docker registry
     * @example ZXhhbXBsZVVzZXI6ZXhhbXBsZVBhc3N3b3JkCg==
     */
    registryCredentials?: string
  }) => {
    if (!options.transactionType) throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required')
    if (!options.image) throw new FailureByDesign('PARAM_ERROR', 'Parameter `image` is required')
    if (!options.cmd) throw new FailureByDesign('PARAM_ERROR', 'Parameter `cmd` is required')
    if (options.scheduleIntervalInSeconds && options.cronExpression) throw new FailureByDesign('PARAM_ERROR', 'Parameters `scheduleIntervalInSeconds` and `cronExpression` are mutually exclusive')
    const body: any = {
      version: '3',
      txn_type: options.transactionType,
      image: options.image,
      execution_order: 'parallel', // default execution order
      cmd: options.cmd
    }
    if (options.args) body.args = options.args
    if (options.executionOrder) body.execution_order = options.executionOrder
    if (options.environmentVariables) body.env = options.environmentVariables
    if (options.secrets) body.secrets = options.secrets
    if (options.scheduleIntervalInSeconds) body.seconds = options.scheduleIntervalInSeconds
    if (options.cronExpression) body.cron = options.cronExpression
    if (options.registryCredentials) body.auth = options.registryCredentials
    return await this.post('/contract', body) as Response<DragonchainContractCreateResponse>
  }

  /**
   * Update an existing Smart Contract on your Dragonchain
   *
   * Note that all parameters (aside from contract id) are optional, and only supplied parameters will be updated
   */
  public updateSmartContract = async (options: {
    /**
     * Smart contract id of which to update. Should be a guid
     */
    smartContractId: string,
    /**
     * Docker image to use with the smart contract. Should be in the form registry/image:tag (or just image:tag if it's a docker hub image)
     * @example quay.io/coreos/awscli:latest
     * @example alpine:3.9
     */
    image?: string,
    /**
     * The command to run in your docker container for your application
     * @example echo
     */
    cmd?: string,
    /**
     * The list of arguments to use in conjunction with cmd
     * @example ['input', 'that', 'will', 'be', 'passed', 'in', 'as', 'args', 'to', 'cmd']
     */
    args?: string[],
    /**
     * The execution of the smart contract, can be `serial` or `parallel`. Will default to `parallel`
     *
     * If running in serial, the contract will be queued and executed in order, only one at a time
     *
     * If running in parallel, the contract will be executed as soon as possible after invocation, potentially out of order, and many at a time
     */
    executionOrder?: SmartContractExecutionOrder,
    /**
     * Boolean whether or not the contract should be enabled, and able to be invoked
     */
    enabled?: boolean,
    /**
     * JSON object key-value pairs of strings for environments variables provided to the smart contract on execution
     * @example
     * ```javascript
     *
     * { MY_CUSTOM_ENV_VAR: "my_custom_env_value" }
     * ```
     */
    environmentVariables?: object,
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
    secrets?: object,
    /**
     * Schedule a smart contract to be automatically executed every `x` seconds
     *
     * For example, if `10` is supplied, then this contract will be automatically invoked and create a transaction once every 10 seconds
     *
     * This value should be a whole integer, and not a decimal
     *
     * Note: This is a mutually exclusive parameter with cronExpression
     */
    scheduleIntervalInSeconds?: number,
    /**
     * Schedule a smart contract to be automatically executed on a cadence via a cron expression
     *
     * Note: This is a mutually exclusive parameter with scheduleIntervalInSeconds
     *
     * @example `* * * * *` This will invoke the contract automatically every minute, on the minute
     */
    cronExpression?: string,
    /**
     * The basic-auth credentials necessary to pull the docker container.
     *
     * This should be a base64-encoded string of `username:password` for the docker registry
     *
     * @example ZXhhbXBsZVVzZXI6ZXhhbXBsZVBhc3N3b3JkCg==
     */
    registryCredentials?: string
  }) => {
    if (!options.smartContractId) throw new FailureByDesign('PARAM_ERROR', 'Parameter `smartContractId` is required')
    if (options.scheduleIntervalInSeconds && options.cronExpression) throw new FailureByDesign('PARAM_ERROR', 'Parameters `scheduleIntervalInSeconds` and `cronExpression` are mutually exclusive')
    const body: any = {
      version: '3'
    }
    if (options.image) body.image = options.image
    if (options.cmd) body.cmd = options.cmd
    if (options.args) body.args = options.args
    if (options.executionOrder) body.execution_order = options.executionOrder
    if (options.enabled === true) body.desired_state = 'active'
    if (options.enabled === false) body.desired_state = 'inactive'
    if (options.environmentVariables) body.env = options.environmentVariables
    if (options.secrets) body.secrets = options.secrets
    if (options.scheduleIntervalInSeconds) body.seconds = options.scheduleIntervalInSeconds
    if (options.cronExpression) body.cron = options.cronExpression
    if (options.registryCredentials) body.auth = options.registryCredentials
    return await this.put(`/contract/${options.smartContractId}`, body) as Response<DragonchainContractCreateResponse>
  }

  /**
   * Deletes a deployed smart contract
   */
  public deleteSmartContract = async (options: {
    /**
     * The id of the smart contract to delete. Should be a guid
     */
    smartContractId: string
  }) => {
    if (!options.smartContractId) throw new FailureByDesign('PARAM_ERROR', 'Parameter `smartContractId` is required')
    return await this.delete(`/contract/${options.smartContractId}`) as Response<DragonchainContractCreateResponse>
  }

  /**
   * Get a single smart contract by one of id or transaction type
   */
  public getSmartContract = async (options: {
    /**
     * Contract id to get, mutually exclusive with transactionType
     */
    smartContractId?: string,
    /**
     * Transaction id of smart contract to get, mutually exclusive with smartContractId
     */
    transactionType?: string
  }) => {
    if (options.smartContractId && options.transactionType) throw new FailureByDesign('PARAM_ERROR', 'Only one of `smartContractId` or `transactionType` can be specified')
    if (options.smartContractId) return await this.get(`/contract/${options.smartContractId}`) as Response<SmartContractAtRest>
    if (options.transactionType) return await this.get(`/contract/txn_type/${options.transactionType}`) as Response<SmartContractAtRest>
    throw new FailureByDesign('PARAM_ERROR', 'At least one of `smartContractId` or `transactionType` must be supplied')
  }

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
  public querySmartContracts = async (options: {
    /**
     * lucene query to use for this query request
     * @example `is_serial:true`
     */
    luceneQuery?: string,
    /**
     * Sort syntax of 'field:direction'
     * @example `txn_type:asc`
     */
    sort?: string,
    /**
     * Pagination offset integer of query (default 0)
     */
    offset?: number,
    /**
     * Pagination limit integer of query (default 10)
     */
    limit?: number
  } = {}) => {
    const queryParams: string = this.getLuceneParams(options.luceneQuery, options.sort, options.offset || 0, options.limit || 10)
    return await this.get(`/contract${queryParams}`) as Response<QueryResult<SmartContractAtRest>>
  }

  /**
   * Get verifications for a block. Note that this is only relevant for level 1 chains
   */
  public getVerifications = async (options: {
    /**
     * The block ID to retrieve verifications for
     */
    blockId: string,
    /**
     * The level of verifications to retrieve (2-5). If not supplied, all levels are returned
     */
    level?: number
  }) => {
    if (!options.blockId) throw new FailureByDesign('PARAM_ERROR', 'Parameter `blockId` is required')
    if (options.level) {
      return await this.get(`/verifications/${options.blockId}?level=${options.level}`) as Response<levelVerifications>
    }
    return await this.get(`/verifications/${options.blockId}`) as Response<Verifications>
  }

  /**
   * Get an object from the smart contract heap. This is used for getting stateful data set by the outputs of smart contracts
   */
  public getSmartContractObject = async (options: {
    /**
     * Key of the object to retrieve
     */
    key: string,
    /**
     * Smart contract to get the object from
     *
     * When running from within a smart contract, this is provided via the SMART_CONTRACT_ID environment variable, and doesn't need to be explicitly provided
     */
    smartContractId?: string
  }) => {
    if (!options.key) throw new FailureByDesign('PARAM_ERROR', 'Parameter `key` is required')
    if (!options.smartContractId) {
      if (!process.env.SMART_CONTRACT_ID) throw new FailureByDesign('PARAM_ERROR', 'Parameter `smartContractId` is required when not running within a smart contract')
      options.smartContractId = process.env.SMART_CONTRACT_ID
    }
    const response = await this.get(`/get/${options.smartContractId}/${options.key}`, false) as unknown
    return response as string
  }

  /**
   * List objects from a folder within the heap of a smart contract
   */
  public listSmartContractObjects = async (options: {
    /**
     * The folder to list from the heap. Please note this CANNOT end in a '/'
     *
     * If nothing is provided, it will list at the root of the heap
     * @example folder1
     * @example folder1/subFolder
     */
    prefixKey?: string,
    /**
     * Smart contract to list the objects from
     *
     * When running from within a smart contract, this is provided via the SMART_CONTRACT_ID environment variable, and doesn't need to be explicitly provided
     */
    smartContractId?: string
  } = {}) => {
    if (!options.smartContractId) {
      if (!process.env.SMART_CONTRACT_ID) throw new FailureByDesign('PARAM_ERROR', 'Parameter `smartContractId` is required when not running within a smart contract')
      options.smartContractId = process.env.SMART_CONTRACT_ID
    }
    let path = `/list/${options.smartContractId}/`
    if (options.prefixKey) {
      if (options.prefixKey.endsWith('/')) throw new FailureByDesign('PARAM_ERROR', 'Parameter `prefixKey` cannot end with \'/\'')
      path += `${options.prefixKey}/`
    }
    return await this.get(path) as Response<string[]>
  }

  /**
   * Create a new transaction type for ledgering transactions
   */
  public createTransactionType = async (options: {
    /**
     * The string of the transaction type to create
     * @example cust1
     */
    transactionType: string,
    /**
     * The custom indexes that should be associated with this transaction type
     */
    customIndexes?: TransactionTypeCustomIndex[]
  }) => {
    if (!options.transactionType) throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required')
    const body: any = {
      version: '1',
      txn_type: options.transactionType
    }
    if (options.customIndexes) body.custom_indexes = options.customIndexes
    return await this.post('/transaction-type', body) as Response<SimpleResponse>
  }

  /**
   * Deletes an existing registered transaction type
   */
  public deleteTransactionType = async (options: {
    /**
     * The name of the transaction type to delete
     */
    transactionType: string
  }) => {
    if (!options.transactionType) throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required')
    return await this.delete(`/transaction-type/${options.transactionType}`) as Response<SimpleResponse>
  }

  /**
   * Lists currently created transaction types
   */
  public listTransactionTypes = async () => {
    return await this.get('/transaction-types') as Response<TransactionTypeListResponse>
  }

  /**
   * Updates an existing transaction type with new custom indexes
   */
  public updateTransactionType = async (options: {
    /**
     * The name of the transaction type to update
     */
    transactionType: string,
    /**
     * The custom indexes that should be updated onto the transaction type
     */
    customIndexes: TransactionTypeCustomIndex[]
  }) => {
    if (!options.transactionType) throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required')
    if (!options.customIndexes) throw new FailureByDesign('PARAM_ERROR', 'Parameter `customIndexes` is required')
    const body = {
      version: '1',
      custom_indexes: options.customIndexes
    }
    return await this.put(`/transaction-type/${options.transactionType}`, body) as Response<SimpleResponse>
  }

  /**
   * Gets an existing transaction type from the chain
   */
  public getTransactionType = async (options: {
    /**
     * The name of the transaction type to get
     */
    transactionType: string
  }) => {
    if (!options.transactionType) throw new FailureByDesign('PARAM_ERROR', 'Parameter `transactionType` is required')
    return await this.get(`/transaction-type/${options.transactionType}`) as Response<TransactionTypeResponse>
  }

  /**
   * Gets a list of the chain's interchain addresses
   */
  public getPublicBlockchainAddresses = async () => {
    return await this.get('/public-blockchain-address') as Response<PublicBlockchainAddressListResponse>
  }

  public createBitcoinTransaction = async (options: {
    /**
     * The bitcoin network that the transaction is for (mainnet or testnet)
     */
    network: 'BTC_MAINNET' | 'BTC_TESTNET3',
    /**
     * The desired fee in satoshis/byte
     *
     * If not supplied, an estimate will be automatically generated
     */
    satoshisPerByte?: number,
    /**
     * String data to embed in the transaction as null-data output type
     */
    data?: string,
    /**
     * Change address to use for this transaction. If not supplied, this will be the source address
     */
    changeAddress?: string,
    /**
     * The desired bitcoin outputs to create for this transaction
     */
    outputs?: BitcoinTransactionOutputs[]
  }) => {
    if (!options.network) throw new FailureByDesign('PARAM_ERROR', 'Parameter `network` is required')
    const body: any = {
      network: options.network,
      transaction: {}
    }
    if (options.satoshisPerByte) body.transaction.fee = options.satoshisPerByte
    if (options.data) body.transaction.data = options.data
    if (options.changeAddress) body.transaction.change = options.changeAddress
    if (options.outputs) {
      body.transaction.outputs = []
      options.outputs.forEach(output => {
        body.transaction.outputs.push({
          to: output.scriptPubKey,
          value: output.value
        })
      })
    }
    return await this.post('/public-blockchain-transaction', body) as Response<PublicBlockchainTransactionResponse>
  }

  public createEthereumTransaction = async (options: {
    /**
     * The ethereum network that the transaction is for (ETH/ETC mainnet or testnet)
     */
    network: 'ETH_MAINNET' | 'ETH_ROPSTEN' | 'ETC_MAINNET' | 'ETC_MORDEN',
    /**
     * The (hex-encoded) address to send the transaction to
     */
    to: string,
    /**
     * The (hex-encoded) number of wei to send with this transaction
     */
    value: string,
    /**
     * The (hex-encoded) string of extra data to include with this transaction
     */
    data?: string,
    /**
     * The (hex-encoded) gas price in gwei to pay. If not supplied, this will be estimated automatically
     */
    gasPrice?: string,
    /**
     * The (hex-encoded) gas limit for this transaction. If not supplied, this will be estimated automatically
     */
    gas?: string
  }) => {
    if (!options.network) throw new FailureByDesign('PARAM_ERROR', 'Parameter `network` is required')
    if (!options.to) throw new FailureByDesign('PARAM_ERROR', 'Parameter `to` is required')
    if (!options.value) throw new FailureByDesign('PARAM_ERROR', 'Parameter `value` is required')
    const body: any = {
      network: options.network,
      transaction: {
        to: options.to,
        value: options.value
      }
    }
    if (options.data) body.transaction.data = options.data
    if (options.gasPrice) body.transaction.gasPrice = options.gasPrice
    if (options.gas) body.transaction.gas = options.gas
    return await this.post('/public-blockchain-transaction', body) as Response<PublicBlockchainTransactionResponse>
  }

  /**
   * @hidden
   */
  private getLuceneParams = (query?: string, sort?: string, offset = 0, limit = 10) => {
    const params = new Map()
    if (query) {
      params.set('q', query)
    }
    if (sort) {
      params.set('sort', sort)
    }
    params.set('offset', String(offset))
    params.set('limit', String(limit))

    return this.generateQueryString(params)
  }

  /**
   * @hidden
   */
  private generateQueryString = (queryObject: Map<string, string>) => {
    const query = '?'
    // @ts-ignore
    const params = UrlSearchParams(queryObject)
    const queryString = `${query}${params}`

    return queryString
  }

  /**
   * @hidden
   */
  private async get (path: string, jsonParse: boolean = true) {
    return this.makeRequest(path, 'GET', undefined, undefined, jsonParse)
  }

  /**
   * @hidden
   */
  private async post (path: string, body: string | object, callbackURL?: string) {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
    return this.makeRequest(path, 'POST', callbackURL, bodyString)
  }

  /**
   * @hidden
   */
  private async put (path: string, body: string | object) {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
    return this.makeRequest(path, 'PUT', undefined, bodyString)
  }

  /**
   * @hidden
   */
  private async delete (path: string) {
    return this.makeRequest(path, 'DELETE')
  }

  /**
   * @hidden
   */
  private getFetchOptions (path: string, method: SupportedHTTP, callbackURL: string = '', body: string = '', contentType: string = ''): FetchOptions {
    const timestamp = new Date().toISOString()
    const options = {
      method: method,
      body: body || undefined,
      credentials: 'omit',
      headers: {
        dragonchain: this.credentialService.dragonchainId,
        Authorization: this.credentialService.getAuthorizationHeader(
          method,
          path,
          timestamp,
          contentType,
          body || ''
        ),
        timestamp
      }
    } as FetchOptions
    if (contentType) options.headers['Content-Type'] = contentType
    if (callbackURL) options.headers['X-Callback-URL'] = callbackURL
    return options
  }

  /**
   * @hidden
   * For development purposes only! NodeJS naturally distrusts self signed certs (for good reason!). This function allows users the option to "not care" about self signed certs.
   * @param {function} asyncFunction an async function to call while NODE_TLS_REJECT_UNAUTHORIZED is quickly toggled from "1" to "0" and back to "1"
   */
  private toggleSslCertVerification = async (asyncFunction: Function) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = (this.verify ? '1' : '0')
    const result = await asyncFunction()
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '1'
    return result
  }

  /**
   * @hidden
   */
  private async makeRequest (path: string, method: SupportedHTTP, callbackURL: string = '', body: string = '', jsonParse: boolean = true) {
    let contentType = ''
    // assume content type is json if a body is provided, as it's the only content-type supported
    if (body) contentType = 'application/json'
    const fetchData = this.getFetchOptions(path, method, callbackURL, body, contentType)
    const url = `${this.endpoint}${path}`
    logger.debug(`[DragonchainClient][FETCH][URL] ==> ${url}`)
    logger.debug(`[DragonchainClient][FETCH][DATA] ==> ${JSON.stringify(fetchData)}`)
    // TODO: Use a custom https agent with fetch to properly ignore invalid HTTPS certs without an env var race condition
    const res = await this.toggleSslCertVerification(async () => this.fetch(url, fetchData))
    const { status, ok, statusText } = res
    logger.debug(`[DragonchainClient][${method}] <== ${url} ${status} ${statusText}`)
    const response = await (jsonParse ? res.json() : res.text())
    logger.debug(`[DragonchainClient][${method}] <== ${JSON.stringify(response)}`)
    return { status, response, ok } as Response<any>
  }
}

/**
 * Create and return an instantiation of a dragonchain client
 */
export const createClient = async (options: {
  /**
   * DragonchainId for this client. Not necessary if DRAGONCHAIN_ID env var is set, or if default is set in config file
   */
  dragonchainId?: string,
  /**
   * AuthKeyId to explicitly use with this client. Must be set along with authKey or it will be ignored
   */
  authKeyId?: string,
  /**
   * AuthKey to explicitly use with this client. Must be set along with authKeyId or it will be ignored
   */
  authKey?: string,
  /**
   * Endpoint to explicitly use with this client. Should not have a trailing slash and look something like https://some.url
   */
  endpoint?: string,
  /**
   * Whether or not to verify the https certificate for https connections. Defaults to true if not provided
   */
  verify?: boolean,
  /**
   * The hmac algorithm to use when generating authenticated requests. Defaults to SHA256
   */
  algorithm?: HmacAlgorithm
} = {}) => {
  if (!options.dragonchainId) options.dragonchainId = await getDragonchainId()
  if (!options.endpoint) options.endpoint = await getDragonchainEndpoint(options.dragonchainId)
  // Set defaults
  if (!options.algorithm) options.algorithm = 'SHA256'
  if (options.verify !== false) options.verify = true
  const credentials = await CredentialService.createCredentials(options.dragonchainId, options.authKey || '', options.authKeyId || '', options.algorithm)
  return new DragonchainClient(options.endpoint, credentials, options.verify)
}

/**
 * All Humans are welcome.
 */
