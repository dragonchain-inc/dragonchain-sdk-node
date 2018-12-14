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

import { readFile } from 'fs'
const path = require('path') // import does not work
const os = require('os') // import does not work
import * as crypto from 'crypto'
import * as ini from 'ini'
import { DragonchainRequestObject } from '../dragonchain-client/DragonchainRequestObject'
import { DragonchainCredentials } from './DragonchainCredentials'
import { FailureByDesign } from '../../errors/FailureByDesign'
import { promisify } from 'util'

/**
 * @class CredentialService
 * @description Stateless service to retrieve Dragonchain credentials for use in API requests
 */
export class CredentialService {
  /**
   * @hidden
   */
  private static iPromiseToReadThisFile = promisify(readFile)

  /**
   * Return the HMAC signature used as the Authorization Header on REST requests to your dragonchain.
   * By default, this function searches for credentials on your hard-drive for the requested dragonchainId.
   * If you do not have matching dragonchain credentials in your home directory, you must directly override
   * the credentials using the `DragonchainRequestObject#overridenCredentials` member.
   *
   * An easy way to achieve this is to use the `DragonchainClient#overrideCredentials` method.
   * @public
   */
  public static getAuthorizationHeader = async (dro: DragonchainRequestObject) => {
    const { version, hmacAlgo, dragonchainId } = dro
    const dcCreds = await CredentialService.getDragonchainCredentials(dragonchainId)
    const { authKey, authKeyId } = dcCreds
    const message = CredentialService.getHmacMessageString(dro)
    const hmac = crypto.createHmac(hmacAlgo, authKey)
    const signature = hmac.update(message).digest('base64')
    return `DC${version}-HMAC-${hmacAlgo.toUpperCase()} ${authKeyId}:${signature}`
  }

  /**
   * @hidden
   * @private
   * @name getDragonchainCredentials
   * @description Get an authKey/authKeyId pair
   * @param {string} DragonchainId (optional) dragonchainId to get keys for (default pulling from config files)
   * @returns {DragonchainCredentials}
   * @throws {FailureByDesign<NOT_FOUND|UNEXPECTED_ERROR>}
   */
  static getDragonchainCredentials = async (dragonchainId: string): Promise<DragonchainCredentials> => {
    // check env vars first
    const creds = CredentialService.getCredsFromEnvVars()
    if (creds) return creds

    // make sure dragonchainId is passed so we can look on disk
    if (dragonchainId === '') { throw new FailureByDesign('VALIDATION_ERROR', '"dragonchainId" can not be undefined when checking Dragonchain credential file.') }

    // check credential file on disk.
    const credentialFilePath = CredentialService.getCredentialFilePath()
    try {
      const file = await CredentialService.iPromiseToReadThisFile(credentialFilePath, 'utf-8')
      const config = ini.parse(file)
      const dragonchainCredentials = config[dragonchainId]
      if (dragonchainCredentials === undefined) { throw Error('MISCONFIGURED_CRED_FILE') } // caught below
      const { auth_key_id, auth_key } = config[dragonchainId]
      return { authKey: auth_key, authKeyId: auth_key_id } as DragonchainCredentials
    } catch (e) {
      console.error(e)
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
  private static getHmacMessageString = (dro: DragonchainRequestObject) => {
    const binaryBody = Buffer.from(dro.body || '' as string, 'UTF-8')
    const hashedBase64Content = crypto.createHash(dro.hmacAlgo).update(binaryBody).digest('base64')
    return [
      dro.method.toUpperCase(),
      dro.path,
      dro.dragonchainId,
      dro.timestamp,
      dro.contentType,
      hashedBase64Content
    ].join('\n')
  }

  /**
   * @hidden
   * @static
   * @name getCredentialFilePath
   * @description Get the path for the credential file depending on the OS
   * @returns string of the credential file path
   * @returns {string} dragonchain credential file path from system root.
   * @example e.g.: "/Users/Sally/.dragonchain/credentials"
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
   * @description create a DragonchainCredentials object from creds found in environment variables.
   * @returns {DragonchainCredentials} dragonchain credential file path from system root.
   */
  private static getCredsFromEnvVars = () => {
    const authKey = process.env['AUTH_KEY']
    const authKeyId = process.env['AUTH_KEY_ID']
    if (authKey && authKeyId) return { authKey, authKeyId } as DragonchainCredentials
    return false
  }
}

/**
 * All Humans are welcome.
 */
