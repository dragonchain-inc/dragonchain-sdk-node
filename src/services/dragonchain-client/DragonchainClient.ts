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
  L1DragonchainStatusResult
} from 'src/interfaces/DragonchainClientInterfaces'
import { CredentialService } from '../credential-service/CredentialService'

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
        'Content-Type': 'application/json'
      }
    } as FetchOptions
  }

  /**
   * Checks if a runtime string is valid
   * @hidden
   * @static
   * @name isValidRuntime
   * @param {string} runtime runtime to validate
   * @returns {boolean} true if runtime is valid, false if not.
   */
  static isValidRuntime = (runtime: ContractRuntime) => validRuntimes.includes(runtime)

  /**
   * Checks if a smart contract type string is valid
   * @hidden
   * @static
   * @name isValidSmartContractType
   * @param {string} smartContractType smartContractType to validate
   * @returns {boolean} true if smart contract type is valid, false if not
   */
  static isValidSmartContractType = (smartContractType: string) => validSmartContractTypes.includes(smartContractType)

  /**
   * This method is used to override this SDK's attempt to look-up your credentials in your home directory.
   * After using this method, subsequent requests to your dragonchain will not attempt to look for your credentials.
   *
   * To undo this on an instantiated DragonchainClient, simply call `#clearOverriddenCredentials`
   * @param {string} authKeyId Auth Key ID used in HMAC
   * @param {string} authKey Auth Key used in HMAC
   */
  public overrideCredentials = (authKey: string, authKeyId: string) => {
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
   * If credentials were previously forcefully overridden and mismatch the ID you have set, your requests to dragonchain's api will fail due to an unverifiable HMAC signature.
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
   * Query transactions using Apache Lucene for Elastic Search
   */
  public queryTransactions = (luceneQuery: string): Promise<L1DragonchainTransactionQueryResult> => {
    return this.get(`/transaction?q=${luceneQuery}`)
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
   * Get a single smart contract by name
   */
  public getSmartcontract = (contractName: string): Promise<SmartContractAtRest> => {
    return this.get(`/smartcontract/${contractName}`)
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
  public createCustomContract = (input: CustomContractCreationSchema | LibraryContractCreationSchema): Promise<DragonchainContractCreateResponse> => {
    return this.post(`/contract`, input)
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
  // private put (path: string, body: object) {
  //   const options = { method: 'PUT', body: JSON.stringify(body) } as FetchOptions
  //   return this.makeRequest(path, options)
  // }

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
    // Add authorization header
    fetchOptions.headers.Authorization = await this.credentialService.getAuthorizationHeader(dro)
    this.logger.debug(`[DragonchainClient][${dro.method}][HEADER] => ${JSON.stringify(dro.headers)}`)
    this.logger.debug(`[DragonchainClient][${dro.method}] => ${dro.url}`)
    const res = await this.toggleSslCertVerification(() => this.fetch(dro.url, dro.asFetchOptions()))
    this.logger.debug(`[DragonchainClient][${dro.method}] <= ${dro.url} ${res.status} ${res.statusText}`)
    return res.json()
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
