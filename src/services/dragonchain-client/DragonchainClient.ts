/**
 * Copyright 2018 Dragonchain, Inc. or its affiliates. All Rights Reserved.
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

import { DragonchainRequestObject } from './DragonchainRequestObject'
import fetch from 'node-fetch'
import {
  DragonchainTransactionCreatePayload,
  L1DragonchainTransactionFull,
  DragonchainTransactionCreateResponse,
  SmartContractAtRest,
  ContractRuntime,
  CustomContractCreationSchema,
  L1DragonchainTransactionQueryResult,
  DragonchainContractCreateResponse,
  FetchOptions,
  L1DragonchainStatusResult,
  SmartContractType,
  DragonchainBlockQueryResult,
  validContractLibraries,
  DragonchainBulkTransactions,
  Response
} from 'src/interfaces/DragonchainClientInterfaces'
import { CredentialService } from '../credential-service/CredentialService'
import { URLSearchParams } from 'url'
import { getLogger, LogLevel } from '../../Logger'
import { FailureByDesign } from '../../errors/FailureByDesign'

const validRuntimes = [
  'nodejs6.10',
  'nodejs8.10',
  'java8',
  'python2.7',
  'python3.6',
  'dotnetcore1.0',
  'dotnetcore2.0',
  'dotnetcore2.1',
  'go1.x'
]

const validSmartContractTypes = [
  'transaction',
  'cron'
]

/**
 * HTTP Client that interfaces with the dragonchain api, using credentials stored on your machine.
 * @class DragonchainClient
 */
export class DragonchainClient {
  /**
   * @hidden
   */
  private dragonchainId: string
  /**
   * @hidden
   */
  private verify: boolean
  /**
   * @hidden
   */
  private credentialService: any
  /**
   * @hidden
   */
  private overriddenCredentials?: { authKey: string, authKeyId: string }
  /**
   * @hidden
   */
  private fetch: any
  /**
   * @hidden
   */
  private logger: any

  /**
   * Create an Instance of a DragonchainClient.
   * @param dragonchainId uuid of a target dragonchain
   * @param verify verify SSL Certs when talking to local dragonchains
   * @param injected used only for testing
   */
  constructor (
    dragonchainId: string,
    verify = true,
    injected: any = {}
    ) {
    this.dragonchainId = dragonchainId
    this.verify = verify
    this.logger = injected.logger || getLogger()
    this.fetch = injected.fetch || fetch
    this.credentialService = injected.CredentialService || CredentialService
    this.overriddenCredentials = undefined
  }

  /**
   * Checks if a runtime string is valid
   * @hidden
   * @static
   * @name isValidRuntime
   * @param {ContractRuntime} runtime runtime to validate
   * @returns {boolean} true if runtime is valid, false if not.
   */
  static isValidRuntime = (runtime: ContractRuntime) => validRuntimes.includes(runtime)

  /**
   * Checks if a smart contract type string is valid
   * @hidden
   * @static
   * @name isValidSmartContractType
   * @param {SmartContractType} smartContractType smartContractType to validate
   * @returns {boolean} true if smart contract type is valid, false if not
   */
  static isValidSmartContractType = (smartContractType: SmartContractType) => validSmartContractTypes.includes(smartContractType)

  /**
   * This method is used to override this SDK's attempt to look-up your credentials in your home directory.
   * After using this method, subsequent requests to your dragonchain will not attempt to look for your credentials.
   *
   * To undo this on an instantiated DragonchainClient, simply call `#clearOverriddenCredentials`
   * @param {string} authKeyId Auth Key ID used in HMAC
   * @param {string} authKey Auth Key used in HMAC
   */
  public overrideCredentials = (authKeyId: string, authKey: string) => {
    this.overriddenCredentials = { authKey, authKeyId }
  }

  /**
   * Remove any overridden credentials and fall-back to using the env vars, or credentials file.
   * @name clearOverriddenCredentials
   */
  public clearOverriddenCredentials = () => { this.overriddenCredentials = undefined }

  /**
   * Change the dragonchainId for this DragonchainClient instance.
   *
   * After using this command, subsequent requests to your dragonchain will attempt to locate credentials in your home directory for the new dragonchainId.
   * If unable to locate your credentials for the new chain, requests may throw a `FailureByDesign('NOT_FOUND')` error.
   * If credentials were previously forcefully overridden and mismatch the ID you have set, your requests to dragonchain's api will 403 due to an unverifiable HMAC signature.
   * @param dragonchainId The id of the dragonchain you want to talk to.
   */
  public setDragonchainId = (dragonchainId: string) => {
    this.dragonchainId = dragonchainId
  }

  /**
   * Get a transaction by Id.
   * @param transactionId The transaction id you are looking for.
   */
  public getTransaction = async (transactionId: string) => {
    return await this.get(`/transaction/${transactionId}`) as Response<L1DragonchainTransactionFull>
  }

  /**
   * set the log level of the Dragonchain client
   * @param LogLevel default='error'
   */
  public setLogLevel = (level: LogLevel) => {
    this.logger = getLogger(level)
  }

  /**
   * Query transactions using ElasticSearch query-string syntax
   * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
   * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
   * @example
   * ```javascript
   * myClient.queryTransactions('tag:(bananas OR apples)').then( ...do stuff )
   * ```
   */
  public queryTransactions = async (luceneQuery?: string, sort?: string, offset = 0, limit = 10) => {
    const queryParams: string = this.getLuceneParams(luceneQuery, sort, offset, limit)
    return await this.get(`/transaction${queryParams}`) as Response<L1DragonchainTransactionQueryResult>
  }

  /**
   * get the status of your dragonchain
   */
  public getStatus = async () => await this.get(`/status`) as Response<L1DragonchainStatusResult>

  /**
   * Get a single block by ID
   */
  public getBlock = async (blockId: string) => {
    return await this.get(`/block/${blockId}`) as Response<L1DragonchainTransactionFull>
  }

  /**
   * Query blocks using ElasticSearch query-string syntax
   * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
   * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
   * @example
   * ```javascript
   * myClient.queryBlocks('tag:(bananas OR apples)').then( ...do stuff )
   * ```
   */
  public queryBlocks = async (luceneQuery?: string, sort?: string, offset = 0, limit = 10) => {
    const queryParams: string = this.getLuceneParams(luceneQuery, sort, offset, limit)
    return await this.get(`/block${queryParams}`) as Response<DragonchainBlockQueryResult>
  }

  /**
   * Get a single smart contract by name
   */
  public getSmartContract = async (contractName: string) => {
    return await this.get(`/contract/${contractName}`) as Response<SmartContractAtRest>
  }

  /**
   * Query smart contracts using ElasticSearch query-string syntax
   * For more information on how to use the ElasticSearch query-string syntax checkout the Elastic Search documentation:
   * https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-query-string-query.html#query-string-syntax
   * @example
   * ```javascript
   * myClient.querySmartContracts('tag:(bananas OR apples)').then( ...do stuff )
   * ```
   */
  public querySmartContracts = async (luceneQuery?: string, sort?: string, offset = 0, limit = 10) => {
    const queryParams: string = this.getLuceneParams(luceneQuery, sort, offset, limit)
    return await this.get(`/contract${queryParams}`) as Response<SmartContractAtRest>
  }

  /**
   * Updates existing contract fields in a custom contract
   * @param {string} name The name of the existing contract you want to update
   * @param {string} status update the status of the contract
   * @param {string} scType update the smart contract type
   * @param {string} code update the code on the contract
   * @param {string} runtime update the runtime of the contract
   * @param {boolean} serial update whether or not the contract runs serial
   * @param {object} envVars update the envrionment variables on a contract
   */
  public updateCustomSmartContract = async (name: string, status?: string, scType?: string, code?: string, runtime?: string, serial?: boolean, envVars?: {}) => {
    const body: any = {
      'version': '1',
      'name': name,
      'status': status,
      'sc_type': scType,
      'code': code,
      'runtime': runtime,
      'is_serial': serial
    }
    if (envVars) {
      body['custom_environment_variables'] = envVars
    }
    return await this.put(`/contract/${body.name}`, body) as Response<any> // TODO: Properly type this!!
  }
  /**
   * Update the status of a library contract
   * @param {string} name the name of the existing library contract that you want to update
   * @param {string} status update the status
   */
  public updateLibrarySmartContract = async (name: string, status?: string) => {
    const body: any = {
      'version': '1',
      'name': name,
      'status': status
    }
    return await this.put(`/contract/${body.name}`, body) as Response<any> // TODO: Properly type this!!
  }

  /**
   *  Update your matchmaking data. If you are a level 2-4, you're required to update your asking price.
   *  If you are a level 5 you're required to update your asking price and broadcast interval
   * @param {number} askingPrice update the asking price for your node as a level 2-5
   * @param {number} broadcastInterval update the broadcastInterval as a level 5
   */
  public updateMatchmakingConfig = async (askingPrice: number) => {
    const matchmakingUpdate: any = {
      'matchmaking': {
        'askingPrice': askingPrice
      }
    }
    return await this.put(`/update-matchmaking-data`, matchmakingUpdate) as Response<any> // TODO: Properly type this!!
  }
  /**
   * Update your maximum price for each level of verification as a level 1
   * @param {number} maximumPrice maximum price for each level of verification
   */
  public updateDragonnetConfig = async (maximumPrice: number, level?: number) => {
    const dragonnet = {} as any
    if (!level)[2,3,4,5].forEach(i => { dragonnet[`l${i}`] = { maximumPrice } })
    if (isNaN(level!) || level! > 5 || level! < 0) throw new FailureByDesign('BAD_REQUEST', `Invalid verification level "${level}" requested. Must be between 1-5`)
    if (level! > 0) {
      dragonnet[`l${Math.round(level!)}`] = { maximumPrice }
    }
    return await this.put(`/update-matchmaking-data`, { dragonnet }) as Response<any> // TODO: Properly type this
  }

  /**
   * Create a new Transaction on your Dragonchain.
   * This transaction, if properly structured, will be received by your dragonchain, hashed, and put into a queue for processing into a block.
   * The `transaction_id` returned from this function can be used for checking the status of this transaction.
   * Most importantly; the block in which it has been fixated.
   *
   * @param {DragonchainTransactionCreatePayload} transactionObject
   * @returns {Promise<DragonchainTransactionCreateResponse>}
   */
  public createTransaction = async (transactionObject: DragonchainTransactionCreatePayload) => {
    return await this.post(`/transaction`, transactionObject) as Response<DragonchainTransactionCreateResponse>
  }

  /**
   * Create a bulk transaction by string together a bunch of transactions as JSON objects into an array
   * @param {DragonchainBulkTransactions} transactionBulkObject array of transactions
   * @return {Promise<DragonchainTransactionCreateResponse>}
   */
  public createBulkTransaction = async (transactionBulkObject: DragonchainBulkTransactions) => {
    return await this.post(`/transaction_bulk`, transactionBulkObject) as Response<DragonchainTransactionCreateResponse>
  }

  /**
   * Create a new Smart Contract on your Dragonchain.
   * Create a new custom smart contract on your dragonchain
   * @returns {Promise<DragonchainContractCreateResponse>}
   */
  public createCustomContract = async (body: CustomContractCreationSchema) => {
    return await this.post(`/contract/${body.name}`, body) as Response<DragonchainContractCreateResponse>
  }

  /**
   * Create a preconfigure contract from our library, using the provided interfaces
   * @param {validContractLibraries} body the preconfigured interfaces for smart contract libraries
   */
  public createLibraryContract = async (body: validContractLibraries) => {
    return await this.post(`/contract/${body.name}`, body) as Response<DragonchainContractCreateResponse>
  }

  /**
   * Get all the verifications for one block_id.
   * @param {string} block_id
   * @param {number} level
   */
  public getVerifications = async (blockId: string, level = 0) => {
    if (level) {
      return await this.get(`/verifications/${blockId}?level=${level}`) as Response<any> // TODO: Properly type this!
    }
    return await this.get(`/verifications/${blockId}`) as Response<any> // TODO: Properly type this!
  }

  /**
   * getSmartContractHeap
   * Get from the smart contract heap
   * This function, (unlike other SDK methods) returns raw utf-8 text by design.
   * If you expect the result to be parsed json pass `true` as the jsonParse parameter.
   * @param {string} key the key under which data has been stored in heap
   * @param {string} scName the name of smart contract
   * @param {boolean} jsonParse attempt to parse heap data as JSON. Throws JSONParse error if it fails.
   */
  public getSmartContractHeap = async (key: string, scName: string, jsonParse: boolean = false) => {
    const response = await this.get(`/get/${scName}/${key}`, jsonParse)
    return response as Response<string>
  }

  /**
   * listSmartcontractHeap
   * List from the smart contract heap
   * This function, (unlike other SDK methods) returns an array of raw utf-8 text by design. (not a js object)
   * If you expect the result to be parsed json pass `true` as the jsonParse parameter.
   * @param {string} key the key under which data has been stored in heap
   * @param {string} scName the name of smart contract
   * @param {boolean} jsonParse attempt to parse heap data as JSON. Throws JSONParse error if it fails.
   */
  public listSmartcontractHeap = async (scName: string, jsonParse: boolean = false) => {
    return await this.get(`/list/${scName}/`, jsonParse) as Response<string[]>
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
    const params = new URLSearchParams(queryObject)
    const queryString = `${query}${params}`

    return queryString

  }
  /**
   * @hidden
   */
  private async get (path: string, jsonParse: boolean = true) {
    const options = { method: 'GET' } as FetchOptions
    return this.makeRequest(path, options, jsonParse)
  }

  /**
   * @hidden
   */
  private async post (path: string, body: object) {
    const options = { method: 'POST', body: JSON.stringify(body) } as FetchOptions
    return this.makeRequest(path, options)
  }
  /**
   * @hidden
   */
  private async put (path: string, body: object) {
    const options = { method: 'PUT', body: JSON.stringify(body) } as FetchOptions
    return this.makeRequest(path, options)
  }

  // DELETE => NOT IMPLEMENTED
  // private delete (path: string) {
  //   const options = { method: 'DELETE' } as FetchOptions
  //   return this.makeRequest(path, options)
  // }

  /**
   * @hidden
   * @name toggleSslCertVerification
   * @description For development purposes only! NodeJS naturally distrusts self signed certs (for good reason!). This function allows users the option to "not care" about self signed certs.
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
  private async makeRequest (path: string, fetchOptions: FetchOptions, jsonParse: boolean = true) {
    const dro = new DragonchainRequestObject(path, this.dragonchainId, fetchOptions)

    dro.overriddenCredentials = this.overriddenCredentials
    dro.dragonchainId = this.dragonchainId
    dro.contentType = 'application/json'
    dro.timestamp = new Date().toISOString()

    this.logger.debug(`[DragonchainClient][${dro.method}][HEADER] ==> ${JSON.stringify(dro.headers)}`)
    this.logger.debug(`[DragonchainClient][${dro.method}] ==> ${dro.url}`)
    const res = await this.toggleSslCertVerification(async () => this.fetch(dro.url, await dro.asFetchOptions(this.credentialService)))
    const { status, ok, statusText, json, text } = res
    this.logger.debug(`[DragonchainClient][${dro.method}] <== ${dro.url} ${status} ${statusText}`)
    const response = await (jsonParse ? json() : text())
    this.logger.debug(`[DragonchainClient][${dro.method}] <== ${JSON.stringify(response)}`)
    return { status, response, ok } as Response<any>
  }
}

/**
 * All Humans are welcome.
 */
