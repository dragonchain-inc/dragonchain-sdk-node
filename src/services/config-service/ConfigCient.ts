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

import { readFile } from 'fs'
import { promisify } from 'util'
import { platform, homedir } from 'os'
import * as path from 'path'
import * as ini from 'ini'
import fetch from 'node-fetch'
import { DragonchainCredentials } from '../credential-service/DragonchainCredentials'
import { FailureByDesign } from '../../errors/FailureByDesign'
import { logger } from '../../index'
/**
 * @hidden
 */
let readFileAsync: any = async () => ''
if (readFile) readFileAsync = promisify(readFile)

/**
 * @hidden
 * Get the path for the configuration file depending on the OS
 * @returns {string} dragonchain configuration file path
 * @example e.g.: "~/.dragonchain/credentials" or "%LOCALAPPDATA%\dragonchain\credentials" on Windows
 */
const getConfigFilePath = (injected: any = { platform, homedir }): string => {
  if (injected.platform() === 'win32') {
    return path.join(process.env.LOCALAPPDATA || '', 'dragonchain', 'credentials')
  }
  return path.join(injected.homedir(), '.dragonchain', 'credentials')
}

/**
 * @hidden
 * Get the endpoint for a dragonchain from environment variables
 * @returns {string} Dragonchain enpdoint if found, empty string if not
 */
const getIdFromEnvVars = (): string => {
  return process.env.DRAGONCHAIN_ID || ''
}

/**
 * @hidden
 * get the endpoint for a dragonchain from environment variables
 * @returns {string} Dragonchain enpdoint if found, empty string if not
 */
const getEndpointFromEnvVars = (): string => {
  return process.env.DRAGONCHAIN_ENDPOINT || ''
}

/**
 * @hidden
 * get the credentials for a dragonchain from environment variables
 * @returns {DragonchainCredentials} Dragonchain enpdoint if found, false if not
 */
const getCredsFromEnvVars = (): any => {
  const authKey = process.env.AUTH_KEY
  const authKeyId = process.env.AUTH_KEY_ID
  if (!authKey || !authKeyId) return false
  return { authKey, authKeyId } as DragonchainCredentials
}

/**
 * @hidden
 * get the default dragonchain ID from the configuration file
 * @returns {Promise<string>} dragonchain ID if found in file, empty string if not
 */
const getIdFromFile = async (injected: any = { readFileAsync }): Promise<string> => {
  let config: any = {}
  try {
    config = ini.parse(await injected.readFileAsync(getConfigFilePath(), 'utf-8'))
  } catch (e) {
    logger.debug(`Error loading ID from config file ${e}`)
    return ''
  }
  return config.default && config.default.dragonchain_id ? config.default.dragonchain_id : ''
}

/**
 * @hidden
 * get the dragonchain endpoint from the configuration file
 * @returns {Promise<string>} dragonchain endpoint if found in file, empty string if not
 */
const getEndpointFromFile = async (dragonchainId: string, injected: any = { readFileAsync }): Promise<string> => {
  let config: any = {}
  try {
    config = ini.parse(await injected.readFileAsync(getConfigFilePath(), 'utf-8'))
  } catch (e) {
    logger.debug(`Error loading from config file ${e}`)
    return ''
  }
  return config[dragonchainId] && config[dragonchainId].endpoint ? config[dragonchainId].endpoint : ''
}

/**
 * @hidden
 * get the dragonchain credentials from the configuration file
 * @returns {Promise<DragonchainCredentials>} dragonchain credentials if found in file, false if not
 */
const getCredsFromFile = async (dragonchainId: string, injected: any = { readFileAsync }): Promise<any> => {
  let config: any = {}
  try {
    config = ini.parse(await injected.readFileAsync(getConfigFilePath(), 'utf-8'))
  } catch (e) {
    logger.debug(`Error loading credentials from config file ${e}`)
    return false
  }
  if (!config[dragonchainId]) return false
  const { auth_key, auth_key_id } = config[dragonchainId]
  if (!auth_key || !auth_key_id) return false
  return {
    authKey: auth_key,
    authKeyId: auth_key_id
  } as DragonchainCredentials
}

/**
 * @hidden
 * use a remote service to fetch the endpoint of a dragonchain by id
 * @param {string} dragonchainId dragonchainId to request endpoint for
 * @returns {Promise<string>} the endpoint of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>} if unable to contact remote service or not found
 */
const getEndpointFromRemote = async (dragonchainId: string, injected: any = { fetch }): Promise<string> => {
  try {
    const result = await injected.fetch(`https://matchmaking.api.dragonchain.com/registration/${dragonchainId}`, { timeout: 30000 })
    const json: any = result.json()
    const endpoint: string = json.url
    if (!endpoint) throw new Error(`Bad response from remote service ${json}`) // Caught and re-thrown below
    return endpoint
  } catch (e) {
    throw new FailureByDesign('NOT_FOUND', `Failure to retrieve dragonchain endpoint from remote service ${e}`)
  }
}

/**
 * @hidden
 * get credentials for a dragonchain from the standard location for a smart contract
 * @returns {Promise<DragonchainCredentials>} dragonchain credentials if found, false if not
 */
const getCredsAsSmartContract = async (injected: any = { readFileAsync }): Promise<any> => {
  let authKeyId: string = ''
  let authKey: string = ''
  const basePath = path.join('/', 'var', 'openfaas', 'secrets')
  try {
    authKeyId = await injected.readFileAsync(path.join(basePath, `sc-${process.env.SMART_CONTRACT_ID}-auth-key-id`), 'utf-8')
    authKey = await injected.readFileAsync(path.join(basePath, `sc-${process.env.SMART_CONTRACT_ID}-secret-key`), 'utf-8')
  } catch (e) {
    logger.debug(`Error loading credentials from SC location ${e}`)
    return false
  }
  if (!authKeyId || !authKey) return false
  return { authKey, authKeyId } as DragonchainCredentials
}

/**
 * Get the default configured dragonchainId from environment/config file
 * @returns {Promise<string>}
 * @throws {FailureByDesign<NOT_FOUND>}
 */
const getDragonchainId = async (injected: any = { getIdFromEnvVars, getIdFromFile }): Promise<string> => {
  logger.debug('Checking if dragonchain_id is in the environment')
  let dragonchainId = injected.getIdFromEnvVars()
  if (dragonchainId) return dragonchainId
  logger.debug('Dragonchain ID not provided in environment, will search on disk')
  dragonchainId = await injected.getIdFromFile()
  if (dragonchainId) return dragonchainId
  throw new FailureByDesign('NOT_FOUND', 'Configuration file is missing a default id')
}

/**
 * @hidden
 * Get the endpoint for a dragonchain. First checks environment, then configuration files, then a remote service
 * @param {string} dragonchainId dragonchainId to get endpoint for
 * @returns {Promise<string>} Endpoint of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>}
 */
const getDragonchainEndpoint = async (dragonchainId: string, injected: any = { getEndpointFromEnvVars, getEndpointFromFile, getEndpointFromRemote }): Promise<string> => {
  let endpoint = injected.getEndpointFromEnvVars()
  if (endpoint) return endpoint
  logger.debug('Endpoint isn\'t in environment, trying to load from ini config file')
  endpoint = await injected.getEndpointFromFile(dragonchainId)
  if (endpoint) return endpoint
  logger.debug('Endpoint isn\'t in config file, trying to load from remote service')
  return injected.getEndpointFromRemote(dragonchainId) // This will throw NOT_FOUND if necessary
}

/**
 * Get the credentials for a dragonchain. First checks environment, then configuration files, then a smart contract location
 * @param {string} dragonchainId dragonchainId to get credentials for
 * @returns {DragonchainCredentials} Credentials of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>}
 */
const getDragonchainCredentials = async (dragonchainId: string, injected: any = { getCredsFromEnvVars, getCredsFromFile, getCredsAsSmartContract }): Promise<DragonchainCredentials> => {
  let credentials: DragonchainCredentials = injected.getCredsFromEnvVars()
  if (credentials) return credentials
  logger.debug('Credentials aren\'t in environment, trying to load from ini config file')
  credentials = await injected.getCredsFromFile(dragonchainId)
  if (credentials) return credentials
  logger.debug('Credentials aren\'t in config file, trying to load as a smart contract')
  credentials = await injected.getCredsAsSmartContract()
  if (credentials) return credentials
  throw new FailureByDesign('NOT_FOUND', `Credentials for ${dragonchainId} could not be found`)
}

export {
  getDragonchainId,
  getDragonchainEndpoint,
  getDragonchainCredentials,
  getConfigFilePath,
  getIdFromEnvVars,
  getEndpointFromEnvVars,
  getCredsFromEnvVars,
  getIdFromFile,
  getEndpointFromFile,
  getCredsFromFile,
  getEndpointFromRemote,
  getCredsAsSmartContract
}

/**
 * All Humans are welcome.
 */
