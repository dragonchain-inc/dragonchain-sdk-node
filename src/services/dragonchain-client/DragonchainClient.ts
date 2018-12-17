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
  LibraryContractCreationSchema,
  L1DragonchainTransactionQueryResult,
  DragonchainContractCreateResponse,
  FetchOptions,
  L1DragonchainStatusResult,
  SmartContractType,
  DragonchainBlockQueryResult
} from 'src/interfaces/DragonchainClientInterfaces'
import { CredentialService } from '../credential-service/CredentialService'
// import { start } from 'repl';

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
  private defaultFetchOptions: FetchOptions
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
   * @public
   * @param {string} dragonchainId dragonchain id to associate with this client
   * @param {boolean|undefined} verify (Optional: true) Verify the TLS certificate of the dragonchain
   */
  constructor (
    dragonchainId: string,
    verify = true,
    injectedFetch: any = null,
    injectedCredentialService: any = null,
    injectedLogger: any = null
    ) {
    this.dragonchainId = dragonchainId
    this.verify = verify
    this.logger = injectedLogger || console
    this.fetch = injectedFetch || fetch
    this.credentialService = injectedCredentialService || CredentialService
    this.defaultFetchOptions = {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        dragonchain: this.dragonchainId
      }
    } as FetchOptions
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
    this.defaultFetchOptions.overriddenCredentials = { authKey, authKeyId }
  }

  /**
   * Remove any overridden credentials and fall-back to using the standard credentials file.
   * @name clearOverriddenCredentials
   */
  public clearOverriddenCredentials = () => this.defaultFetchOptions.overriddenCredentials = undefined

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
  public getTransaction = (transactionId: string): Promise<L1DragonchainTransactionFull> => {
    return this.get(`/transaction/${transactionId}`)
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
  public queryTransactions = (luceneQuery: string, sort?: string, offset = 0, limit = 10): Promise<L1DragonchainTransactionQueryResult> => {
    const queryParams: string = this.getLuceneParams(luceneQuery, sort, offset, limit)
    return this.get(`/transaction${queryParams}`)
  }

  /**
   * get the status of your dragonchain
   */
  public getStatus = (): Promise<L1DragonchainStatusResult> => this.get(`/status`)

  /**
   * Get a single block by ID
   */
  public getBlock = (blockId: string): Promise<L1DragonchainTransactionFull> => {
    return this.get(`/block/${blockId}`)
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
  public queryBlocks = (luceneQuery: string, sort?: string, offset = 0, limit = 10): Promise<DragonchainBlockQueryResult> => {
    const queryParams: string = this.getLuceneParams(luceneQuery, sort, offset, limit)
    return this.get(`/block${queryParams}`)
  }

  /**
   * Get a single smart contract by name
   */
  public getSmartContract = (contractName: string): Promise<SmartContractAtRest> => {
    return this.get(`/contract/${contractName}`)
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
  public querySmartContracts = (luceneQuery: string, sort?: string, offset = 0, limit = 10): Promise<SmartContractAtRest> => {
    const queryParams: string = this.getLuceneParams(luceneQuery, sort, offset, limit)
    return this.get(`/contract${queryParams}`)
  }

  /**
   * Updates existing contract fields
   */
  public updateSmartContract = (name: string, status: string, scType: string, code: string, runtime: string, serial: boolean, envVars: {}) => {
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
    return this.put(`/contract/${name}`, body)
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
  public createTransaction = (transactionObject: DragonchainTransactionCreatePayload): Promise<DragonchainTransactionCreateResponse> => {
    return this.post(`/transaction`, transactionObject)
  }

  /**
   * Create a new Smart Contract on your Dragonchain.
   * Create a new custom smart contract on your dragonchain
   * @returns {Promise<DragonchainContractCreateResponse>}
   */
  public createContract = (body: CustomContractCreationSchema | LibraryContractCreationSchema, name: string): Promise<DragonchainContractCreateResponse> => {
    return this.post(`/contract/${name}`, body)
  }

  /**
   * Get all the verifications for one block_id.
   * @param {string} block_id
   * @param {number} level
   */
  public getVerification = (blockId: string, level = 0) => {
    if (level) {
      return this.get(`/verification/${blockId}?level=${level}`)
    }
    return this.get(`/verification/${blockId}`)
  }

  public getSmartContractHeap = (key: string, scName: string) => {
    return this.get(`/get/${scName}/HEAP/${key}`)
  }

  public listSmartcontractHeap = (scName: string) => {
    return this.get(`/list/${scName}/`)
  }

  getLuceneParams = (query: string, sort?: string, offset = 0, limit = 10) => {
    const params: any = {
      'query': query,
      'offset': offset,
      'limit': limit
    }
    if (sort) {
      params['sort'] = sort
    }

    return this.generateQueryString(params)
  }

  generateQueryString = (queryObject: object) => {
    let queryString = '?'
    for (const [key, value] of Object.entries(queryObject)) {
      queryString = `${queryString}=${key}:${value}&`
    }
    return queryString

  }
  /**
   * @hidden
   */
  private get (path: string) {
    const options = { method: 'GET' } as FetchOptions
    return this.makeRequest(path, options)
  }

  /**
   * @hidden
   */
  private post (path: string, body: object) {
    const options = { method: 'POST', body: JSON.stringify(body) } as FetchOptions
    return this.makeRequest(path, options)
  }

  // PUT => NOT IMPLEMENTED
  private put (path: string, body: object) {
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
  private async makeRequest (path: string, options: FetchOptions) {
    const fetchOptions = { ...this.defaultFetchOptions, ...options } as FetchOptions
    const dro = new DragonchainRequestObject(path, this.dragonchainId, fetchOptions)
    this.defaultFetchOptions.headers.timestamp = dro.timestamp
    // Add authorization header
    fetchOptions.headers.Authorization = await this.credentialService.getAuthorizationHeader(dro)
    this.logger.debug(`[DragonchainClient][${dro.method}][HEADER] => ${JSON.stringify(dro.headers)}`)
    this.logger.debug(`[DragonchainClient][${dro.method}] => ${dro.url}`)
    console.log(dro.url, dro.asFetchOptions())
    const res = await this.toggleSslCertVerification(() => this.fetch(dro.url, dro.asFetchOptions()))
    this.logger.debug(`[DragonchainClient][${dro.method}] <= ${dro.url} ${res.status} ${res.statusText}`)
    const result = await res.json()
    console.log('[RESULT]---->>>>>>', result)
    if (res.status >= 200 && res.status < 300) {
      return result
    } else {
      throw new Error(`Unexpected response from the dragonchain. Response: ${res.status} | Error: ${res.statusText}`)
    }
  }
}

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
 * All Humans are welcome.
 */
