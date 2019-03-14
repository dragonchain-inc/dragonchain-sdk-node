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
import { DragonchainCredentials } from './DragonchainCredentials';
export declare type HmacAlgorithm = 'SHA256' | 'SHA3-256' | 'BLAKE2b512';
/**
 * @class CredentialService
 * @description Stateless service to retrieve Dragonchain credentials for use in API requests
 */
export declare class CredentialService {
    /**
     * @hidden
     */
    dragonchainId: string;
    /**
     * @hidden
     */
    credentials: DragonchainCredentials;
    /**
     * @hidden
     */
    hmacAlgo: HmacAlgorithm;
    /**
     * Create an Instance of a CredentialService
     * @param dragonchainId dragonchainId associated with these credentials
     * @param authKey authKey to use with these credentials
     * @param authKeyId authKeyId to use with these credentials
     * @param hmacAlgo hmac algorithm to use
     */
    constructor(dragonchainId: string, authKey?: string, authKeyId?: string, hmacAlgo?: HmacAlgorithm);
    /**
     * Manually override the credentials for this instance
     * @public
     */
    overrideCredentials: (authKeyId: string, authKey: string) => void;
    /**
     * Return the HMAC signature used as the Authorization Header on REST requests to your dragonchain.
     * @public
     */
    getAuthorizationHeader: (method: string, path: string, timestamp: string, contentType: string, body: string) => string;
    /**
     * @hidden
     * @name getDragonchainId
     * @description Get a dragonchainId from environment/config file
     * @returns {string}
     * @throws {FailureByDesign<NOT_FOUND|UNEXPECTED_ERROR>}
     */
    static getDragonchainId: () => string;
    /**
     * @hidden
     * @name getDragonchainCredentials
     * @description Get an authKey/authKeyId pair
     * @param {string} dragonchainId (optional) dragonchainId to get keys for (default pulling from config files)
     * @returns {DragonchainCredentials}
     * @throws {FailureByDesign<NOT_FOUND|UNEXPECTED_ERROR>}
     */
    static getDragonchainCredentials: (dragonchainId: string) => DragonchainCredentials;
    /**
     * @hidden
     * @name getHmacMessageString
     * @private
     * @static
     * @description transform a DragonchainRequestObject into a compliant hmac message string
     */
    private static getHmacMessageString;
    /**
     * @hidden
     * @static
     * @name getCredentialFilePath
     * @description Get the path for the credential file depending on the OS
     * @returns string of the credential file path
     * @returns {string} dragonchain credential file path
     * @example e.g.: "~/.dragonchain/credentials" or "%LOCALAPPDATA%\dragonchain\credentials" on Windows
     */
    private static getCredentialFilePath;
    /**
     * @hidden
     * @static
     * @name getCredsFromEnvVars
     * @description create a DragonchainCredentials object from creds found in environment variables
     * @returns {DragonchainCredentials} dragonchain credentials if provided in the environment
     */
    static getCredsFromEnvVars: () => false | DragonchainCredentials;
    /**
     * @hidden
     * @static
     * @name getIdFromEnvVars
     * @description get the dragonchainId from the environment
     * @returns {string} dragonchain id if found in env, empty string if not
     */
    static getIdFromEnvVars: () => string;
}
/**
 * All Humans are welcome.
 */
