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
 * @hidden
 * Service to store Dragonchain credentials and generate authentication for use in API requests
 */
export declare class CredentialService {
    dragonchainId: string;
    credentials: DragonchainCredentials;
    hmacAlgo: HmacAlgorithm;
    /**
     * async constructor to return an initialized CredentialService instantiation
     */
    static createCredentials: (dragonchainId: string, authKey?: string, authKeyId?: string, hmacAlgo?: HmacAlgorithm, injected?: any) => Promise<CredentialService>;
    /**
     * Construct a CredentialService object (This should not be called directly, and instead should be constructed with createCredentials)
     */
    constructor(dragonchainId: string, credentials: DragonchainCredentials, hmacAlgo: HmacAlgorithm);
    /**
     * Return the HMAC signature used as the Authorization Header on REST requests to your dragonchain.
     */
    getAuthorizationHeader: (method: string, path: string, timestamp: string, contentType: string, body: string) => string;
    /**
     * transform a DragonchainRequestObject into a compliant hmac message string
     */
    private static getHmacMessageString;
}
