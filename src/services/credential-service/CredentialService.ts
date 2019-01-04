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

import { readFileSync } from 'fs'
const path = require('path') // import does not work
const os = require('os') // import does not work
import * as crypto from 'crypto'
import * as ini from 'ini'
import { DragonchainCredentials } from './DragonchainCredentials'
import { FailureByDesign } from '../../errors/FailureByDesign'
import { logger } from '../../index'

export type HmacAlgorithm = 'SHA256' | 'SHA3-256' | 'BLAKE2b512'

/**
 * @class CredentialService
 * @description Stateless service to retrieve Dragonchain credentials for use in API requests
 */
export class CredentialService {
  /**
   * @hidden
   */
  public dragonchainId: string
  /**
   * @hidden
   */
  public credentials: DragonchainCredentials
  /**
   * @hidden
   */
  public hmacAlgo: HmacAlgorithm

  /**
   * Create an Instance of a CredentialService
   * @param dragonchainId dragonchainId associated with these credentials
   * @param authKey authKey to use with these credentials
   * @param authKeyId authKeyId to use with these credentials
   * @param hmacAlgo hmac algorithm to use
   */
  constructor (
    dragonchainId: string,
    authKey: string = '',
    authKeyId: string = '',
    hmacAlgo: HmacAlgorithm = 'SHA256'
  ) {
    this.dragonchainId = dragonchainId
    if (authKey && authKeyId) {
      logger.debug('Auth Key/Id provided explicitly, will not search env/disk')
      this.credentials = { authKey, authKeyId }
    } else {
      try {
        this.credentials = CredentialService.getDragonchainCredentials(this.dragonchainId)
      } catch {  // don't require credentials to be present on construction
        this.credentials = { authKey: '', authKeyId: '' }
      }
    }
    this.hmacAlgo = hmacAlgo
  }

  /**
   * Manually override the credentials for this instance
   * @public
   */
  public overrideCredentials = (authKeyId: string, authKey: string) => {
    this.credentials = { authKey, authKeyId }
  }

  /**
   * Return the HMAC signature used as the Authorization Header on REST requests to your dragonchain.
   * @public
   */
  public getAuthorizationHeader = (method: string, path: string, timestamp: string, contentType: string, body: string) => {
    const message = CredentialService.getHmacMessageString(method, path, this.dragonchainId, timestamp, contentType, body, this.hmacAlgo)
    const hmac = crypto.createHmac(this.hmacAlgo, this.credentials.authKey)
    const signature = hmac.update(message).digest('base64')
    return `DC1-HMAC-${this.hmacAlgo} ${this.credentials.authKeyId}:${signature}`
  }

  /**
   * @hidden
   * @name getDragonchainId
   * @description Get a dragonchainId from environment/config file
   * @returns {string}
   * @throws {FailureByDesign<NOT_FOUND|UNEXPECTED_ERROR>}
   */
  public static getDragonchainId = (): string => {
    // check env vars first
    const id = CredentialService.getIdFromEnvVars()
    if (id) return id
    logger.debug('Dragonchain ID not provided in environment, will search on disk')

    // check credential file on disk.
    const credentialFilePath = CredentialService.getCredentialFilePath()
    logger.debug(`Will look for Dragonchain ID in file at ${credentialFilePath}`)
    try {
      const config = ini.parse(readFileSync(credentialFilePath, 'utf-8'))
      const dragonchainCredentials = config['default']
      if (dragonchainCredentials === undefined) { throw Error('MISCONFIGURED_CRED_FILE') } // caught below
      const { dragonchain_id } = config['default']
      return dragonchain_id
    } catch (e) {
      if (e.message === 'MISCONFIGURED_CRED_FILE') { throw new FailureByDesign('NOT_FOUND', 'credential file is missing a default id') }
      if (e.code === 'ENOENT') { throw new FailureByDesign('NOT_FOUND', `credential file not found at "${credentialFilePath}"`) }
      throw new FailureByDesign('UNEXPECTED_ERROR', `Something unexpected happened while looking for credentials at "${credentialFilePath}"`)
    }
  }

  /**
   * @hidden
   * @name getDragonchainCredentials
   * @description Get an authKey/authKeyId pair
   * @param {string} DragonchainId (optional) dragonchainId to get keys for (default pulling from config files)
   * @returns {DragonchainCredentials}
   * @throws {FailureByDesign<NOT_FOUND|UNEXPECTED_ERROR>}
   */
  public static getDragonchainCredentials = (dragonchainId: string): DragonchainCredentials => {
    // check env vars first
    const creds = CredentialService.getCredsFromEnvVars()
    if (creds) return creds
    logger.debug('Credentials not provided in environment, will search on disk')

    // make sure dragonchainId is passed so we can look on disk
    if (dragonchainId === '') { throw new FailureByDesign('VALIDATION_ERROR', '"dragonchainId" can not be undefined when checking Dragonchain credential file.') }

    // check credential file on disk.
    const credentialFilePath = CredentialService.getCredentialFilePath()
    logger.debug(`Will look for credentials in file at ${credentialFilePath}`)
    try {
      const config = ini.parse(readFileSync(credentialFilePath, 'utf-8'))
      const dragonchainCredentials = config[dragonchainId]
      if (dragonchainCredentials === undefined) { throw Error('MISCONFIGURED_CRED_FILE') } // caught below
      const { auth_key_id, auth_key } = config[dragonchainId]
      return { authKey: auth_key, authKeyId: auth_key_id } as DragonchainCredentials
    } catch (e) {
      if (e.message === 'MISCONFIGURED_CRED_FILE') { throw new FailureByDesign('NOT_FOUND', `credential file is missing a config for ${dragonchainId}`) }
      if (e.code === 'ENOENT') { throw new FailureByDesign('NOT_FOUND', `credential file not found at "${credentialFilePath}"`) }
      throw new FailureByDesign('UNEXPECTED_ERROR', `Something unexpected happened while looking for credentials at "${credentialFilePath}"`)
    }
  }

  /**
   * @hidden
   * @name getHmacMessageString
   * @private
   * @static
   * @description transform a DragonchainRequestObject into a compliant hmac message string
   */
  private static getHmacMessageString = (method: string, path: string, dragonchainId: string, timestamp: string, contentType: string, body: string, hmacAlgo: HmacAlgorithm) => {
    const binaryBody = Buffer.from(body || '', 'UTF-8')
    const hashedBase64Content = crypto.createHash(hmacAlgo).update(binaryBody).digest('base64')
    return [
      method.toUpperCase(),
      path,
      dragonchainId,
      timestamp,
      contentType,
      hashedBase64Content
    ].join('\n')
  }

  /**
   * @hidden
   * @static
   * @name getCredentialFilePath
   * @description Get the path for the credential file depending on the OS
   * @returns string of the credential file path
   * @returns {string} dragonchain credential file path
   * @example e.g.: "~/.dragonchain/credentials" or "%LOCALAPPDATA%\dragonchain\credentials" on Windows
   */
  private static getCredentialFilePath = () => {
    if (os.platform() === 'win32') {
      path.join(process.env.LOCALAPPDATA, 'dragonchain', 'credentials')
    }
    return path.join(os.homedir(), '.dragonchain', 'credentials')
  }

  /**
   * @hidden
   * @static
   * @name getCredsFromEnvVars
   * @description create a DragonchainCredentials object from creds found in environment variables
   * @returns {DragonchainCredentials} dragonchain credentials if provided in the environment
   */
  static getCredsFromEnvVars = () => {
    const authKey = process.env['AUTH_KEY']
    const authKeyId = process.env['AUTH_KEY_ID']
    if (authKey && authKeyId) return { authKey, authKeyId } as DragonchainCredentials
    return false
  }

  /**
   * @hidden
   * @static
   * @name getIdFromEnvVars
   * @description get the dragonchainId from the environment
   * @returns {string} dragonchain id if found in env, empty string if not
   */
  static getIdFromEnvVars = () => {
    const dragonchainId = process.env['DRAGONCHAIN_ID']
    if (dragonchainId) return dragonchainId
    return ''
  }
}

/**
 * All Humans are welcome.
 */
