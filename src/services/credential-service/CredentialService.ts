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

import * as crypto from 'crypto';
import { getDragonchainCredentials } from '../config-service';
import { DragonchainCredentials } from './DragonchainCredentials';

export type HmacAlgorithm = 'SHA256' | 'SHA3-256' | 'BLAKE2b512';

/**
 * @hidden
 * Service to store Dragonchain credentials and generate authentication for use in API requests
 */
export class CredentialService {
  public dragonchainId: string;
  public credentials: DragonchainCredentials;
  public hmacAlgo: HmacAlgorithm;

  /**
   * async constructor to return an initialized CredentialService instantiation
   */
  public static createCredentials = async (
    dragonchainId: string,
    authKey: string = '',
    authKeyId: string = '',
    hmacAlgo: HmacAlgorithm = 'SHA256',
    injected: any = { getDragonchainCredentials }
  ) => {
    if (!authKey || !authKeyId) {
      const credentials = await injected.getDragonchainCredentials(dragonchainId);
      authKey = credentials.authKey;
      authKeyId = credentials.authKeyId;
    }
    return new CredentialService(dragonchainId, { authKey, authKeyId }, hmacAlgo);
  };

  /**
   * Construct a CredentialService object (This should not be called directly, and instead should be constructed with createCredentials)
   */
  public constructor(dragonchainId: string, credentials: DragonchainCredentials, hmacAlgo: HmacAlgorithm) {
    this.dragonchainId = dragonchainId;
    this.credentials = credentials;
    this.hmacAlgo = hmacAlgo;
  }

  /**
   * Return the HMAC signature used as the Authorization Header on REST requests to your dragonchain.
   */
  public getAuthorizationHeader = (method: string, path: string, timestamp: string, contentType: string, body: string) => {
    const message = CredentialService.getHmacMessageString(method, path, this.dragonchainId, timestamp, contentType, body, this.hmacAlgo);
    const hmac = crypto.createHmac(this.hmacAlgo, this.credentials.authKey);
    const signature = hmac.update(message).digest('base64');
    return `DC1-HMAC-${this.hmacAlgo} ${this.credentials.authKeyId}:${signature}`;
  };

  /**
   * transform a DragonchainRequestObject into a compliant hmac message string
   */
  private static getHmacMessageString = (method: string, path: string, dragonchainId: string, timestamp: string, contentType: string, body: string, hmacAlgo: HmacAlgorithm) => {
    const binaryBody = Buffer.from(body || '', 'utf-8');
    const hashedBase64Content = crypto
      .createHash(hmacAlgo)
      .update(binaryBody)
      .digest('base64');
    return [method.toUpperCase(), path, dragonchainId, timestamp, contentType, hashedBase64Content].join('\n');
  };
}
