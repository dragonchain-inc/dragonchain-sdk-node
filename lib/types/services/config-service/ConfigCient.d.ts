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
import { DragonchainCredentials } from '../credential-service/DragonchainCredentials';
/**
 * @hidden
 * Get the path for the configuration file depending on the OS
 * @returns {string} dragonchain configuration file path
 * @example e.g.: "~/.dragonchain/credentials" or "%LOCALAPPDATA%\dragonchain\credentials" on Windows
 */
declare const getConfigFilePath: (injected?: any) => string;
/**
 * @hidden
 * Get the endpoint for a dragonchain from environment variables
 * @returns {string} Dragonchain enpdoint if found, empty string if not
 */
declare const getIdFromEnvVars: () => string;
/**
 * @hidden
 * get the endpoint for a dragonchain from environment variables
 * @returns {string} Dragonchain enpdoint if found, empty string if not
 */
declare const getEndpointFromEnvVars: () => string;
/**
 * @hidden
 * get the credentials for a dragonchain from environment variables
 * @returns {DragonchainCredentials} Dragonchain enpdoint if found, false if not
 */
declare const getCredsFromEnvVars: () => any;
/**
 * @hidden
 * get the default dragonchain ID from the configuration file
 * @returns {Promise<string>} dragonchain ID if found in file, empty string if not
 */
declare const getIdFromFile: (injected?: any) => Promise<string>;
/**
 * @hidden
 * get the dragonchain endpoint from the configuration file
 * @returns {Promise<string>} dragonchain endpoint if found in file, empty string if not
 */
declare const getEndpointFromFile: (dragonchainId: string, injected?: any) => Promise<string>;
/**
 * @hidden
 * get the dragonchain credentials from the configuration file
 * @returns {Promise<DragonchainCredentials>} dragonchain credentials if found in file, false if not
 */
declare const getCredsFromFile: (dragonchainId: string, injected?: any) => Promise<any>;
/**
 * @hidden
 * use a remote service to fetch the endpoint of a dragonchain by id
 * @param {string} dragonchainId dragonchainId to request endpoint for
 * @returns {Promise<string>} the endpoint of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>} if unable to contact remote service or not found
 */
declare const getEndpointFromRemote: (dragonchainId: string, injected?: any) => Promise<string>;
/**
 * @hidden
 * get credentials for a dragonchain from the standard location for a smart contract
 * @returns {Promise<DragonchainCredentials>} dragonchain credentials if found, false if not
 */
declare const getCredsAsSmartContract: (injected?: any) => Promise<any>;
/**
 * Get the default configured dragonchainId from environment/config file
 * @returns {Promise<string>}
 * @throws {FailureByDesign<NOT_FOUND>}
 */
declare const getDragonchainId: (injected?: any) => Promise<string>;
/**
 * @hidden
 * Get the endpoint for a dragonchain. First checks environment, then configuration files, then a remote service
 * @param {string} dragonchainId dragonchainId to get endpoint for
 * @returns {Promise<string>} Endpoint of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>}
 */
declare const getDragonchainEndpoint: (dragonchainId: string, injected?: any) => Promise<string>;
/**
 * Get the credentials for a dragonchain. First checks environment, then configuration files, then a smart contract location
 * @param {string} dragonchainId dragonchainId to get credentials for
 * @returns {DragonchainCredentials} Credentials of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>}
 */
declare const getDragonchainCredentials: (dragonchainId: string, injected?: any) => Promise<DragonchainCredentials>;
export { getDragonchainId, getDragonchainEndpoint, getDragonchainCredentials, getConfigFilePath, getIdFromEnvVars, getEndpointFromEnvVars, getCredsFromEnvVars, getIdFromFile, getEndpointFromFile, getCredsFromFile, getEndpointFromRemote, getCredsAsSmartContract };
/**
 * All Humans are welcome.
 */
