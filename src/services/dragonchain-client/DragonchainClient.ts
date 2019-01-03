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
  SupportedHTTP,
  FetchOptions,
  L1DragonchainStatusResult,
  SmartContractType,
  DragonchainBlockQueryResult,
  validContractLibraries,
  DragonchainBulkTransactions,
  Response,
  Verifications,
  levelVerifications,
  UpdateDataResponse
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
  private endpoint: string
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
  private fetch: any
  /**
   * @hidden
   */
  private logger: any

  /**
   * Create an Instance of a DragonchainClient.
   * @param dragonchainId id of a target dragonchain
   * @param verify verify SSL Certs when talking to local dragonchains
   * @param injected used only for testing
   */
  constructor (
    dragonchainId: string = '',
    verify = true,
    injected: any = {}
    ) {
    if (!dragonchainId) {
      dragonchainId = CredentialService.getDragonchainId()
    }
    this.verify = verify
    this.endpoint = `https://${dragonchainId}.api.dragonchain.com`
    this.logger = injected.logger || getLogger()
    this.fetch = injected.fetch || fetch
    this.credentialService = injected.CredentialService || new CredentialService(dragonchainId)
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
   * set the log level of the Dragonchain client
   * @param LogLevel default='error'
   */
  public setLogLevel = (level: LogLevel) => {
    this.logger = getLogger(level)
  }

  /**
   * This method is used to override this SDK's attempt to automatically fetch credentials automatically with manually specified creds
   *
   * @param {string} authKeyId Auth Key ID used in HMAC
   * @param {string} authKey Auth Key used in HMAC
   */
  public overrideCredentials = (authKeyId: string, authKey: string) => {
    this.credentialService.overrideCredentials(authKeyId, authKey)
  }

  /**
   * Change the dragonchainId for this DragonchainClient instance.
   *
   * After using this command, subsequent requests to your dragonchain will attempt to re-locate credentials for the new dragonchain
   * @param dragonchainId The id of the dragonchain you want to set
   * @param setEndpoint Whether or not to set a new endpoint automatically (for managed chains at .api.dragonchain.com)
   */
  public setDragonchainId = (dragonchainId: string, setEndpoint: boolean = true) => {
    this.credentialService = new CredentialService(dragonchainId)
    if (setEndpoint) this.setEndpoint(`https://${dragonchainId}.api.dragonchain.com`)
  }

  /**
   * Change the endpoint for this DragonchainClient instance.
   *
   * @param endpoint The endpoint of the dragonchain you want to set
   */
  public setEndpoint = (endpoint: string) => {
    this.endpoint = endpoint
  }

  /**
   * Get a transaction by Id.
   * @param transactionId The transaction id you are looking for.
   */
  public getTransaction = async (transactionId: string) => {
    return await this.get(`/transaction/${transactionId}`) as Response<L1DragonchainTransactionFull>
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
    return await this.put(`/contract/${body.name}`, body) as Response<UpdateDataResponse>
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
    return await this.put(`/contract/${body.name}`, body) as Response<UpdateDataResponse>
  }

  /**
   * Update your matchmaking data. If you are a level 2-4, you're required to update your asking price.
   * If you are a level 5 you're required to update your asking price and broadcast interval
   * @param {number} askingPrice (0.0001-1000.0000) the price in DRGN to charge L1 nodes for your verification of their data. Setting this number too high will cause L1's to ignore you more often.
   */
  public updateMatchmakingConfig = async (askingPrice: number) => {
    if (isNaN(askingPrice) || askingPrice < 0.0001 || askingPrice > 1000) { throw new FailureByDesign('BAD_REQUEST', `askingPrice must be between 0.0001 and 1000.`) }
    const matchmakingUpdate: any = {
      'matchmaking': {
        'askingPrice': askingPrice
      }
    }
    return await this.put(`/update-matchmaking-data`, matchmakingUpdate) as Response<UpdateDataResponse>
  }

  /**
   * Update your maximum price for each level of verification.
   * This method is only relevant for L1 nodes.
   * @param {number} maximumPrice (0-1000) maximum price in DRGN you are willing to pay for verifications. If this number is too low, other nodes will not verify your blocks. Changing this number will affect older unverified blocks first.
   * @param {integer} level The level to set maximum price for. If not specified, it will change all level prices
   */
  public updateDragonnetConfig = async (maximumPrice: number, level?: number) => {
    if (isNaN(maximumPrice) || maximumPrice < 0 || maximumPrice > 1000) { throw new FailureByDesign('BAD_REQUEST', 'maxPrice must be between 0 and 1000.') }

    const dragonnet = {} as any
    if (!level) {
      [2,3,4,5].forEach(i => { dragonnet[`l${i}`] = { maximumPrice } })
    } else {
      if (isNaN(level!) || level! > 5 || level! < 1) throw new FailureByDesign('BAD_REQUEST', `Invalid verification level "${level}" requested. Must be between 2-5`)
      if (level! > 0) {
        dragonnet[`l${Math.round(level!)}`] = { maximumPrice }
      }
    }
    return await this.put(`/update-matchmaking-data`, { dragonnet }) as Response<UpdateDataResponse>
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
      return await this.get(`/verifications/${blockId}?level=${level}`) as Response<levelVerifications>
    }
    return await this.get(`/verifications/${blockId}`) as Response<Verifications>
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
   * List objects from a smart contract heap
   * @param {string} scName the name of smart contract
   * @param {string} key the sub-key ('folder') to list in the SC heap (optional. Defaults to root of SC heap)
   */
  public listSmartcontractHeap = async (scName: string, key: string = '') => {
    let path = `/list/${scName}/`
    if (key) path += key
    return await this.get(path) as Response<string[]>
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
    return this.makeRequest(path, 'GET', '', jsonParse)
  }

  /**
   * @hidden
   */
  private async post (path: string, body: string | object) {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
    return this.makeRequest(path, 'POST', bodyString)
  }

  /**
   * @hidden
   */
  private async put (path: string, body: string | object) {
    const bodyString = typeof body === 'string' ? body : JSON.stringify(body)
    return this.makeRequest(path, 'PUT', bodyString)
  }

  /**
   * @hidden
   */
  private getFetchOptions (method: SupportedHTTP, path: string, body: string, contentType: string = 'application/json'): FetchOptions {
    const timestamp = new Date().toISOString()
    return {
      method: method,
      body: body || undefined,
      headers: {
        'Content-Type': contentType,
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
    }
  }

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
  private async makeRequest (path: string, method: SupportedHTTP, body: string = '', jsonParse: boolean = true) {
    const fetchData = this.getFetchOptions(method, path, body)
    const url = `${this.endpoint}${path}`
    this.logger.debug(`[DragonchainClient][FETCH][URL] ==> ${url}`)
    this.logger.debug(`[DragonchainClient][FETCH][DATA] ==> ${JSON.stringify(fetchData)}`)
    // TODO: Use a custom https agent with fetch to properly ignore invalid HTTPS certs without an env var race condition
    const res = await this.toggleSslCertVerification(async () => this.fetch(url, fetchData))
    const { status, ok, statusText } = res
    this.logger.debug(`[DragonchainClient][${method}] <== ${url} ${status} ${statusText}`)
    const response = await (jsonParse ? res.json() : res.text())
    this.logger.debug(`[DragonchainClient][${method}] <== ${JSON.stringify(response)}`)
    return { status, response, ok } as Response<any>
  }
}

/**
 * All Humans are welcome.
 */
