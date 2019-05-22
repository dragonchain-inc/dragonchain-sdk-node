"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const crypto = require("crypto");
const config_service_1 = require("../config-service");
/**
 * @hidden
 * Service to store Dragonchain credentials and generate authentication for use in API requests
 */
class CredentialService {
    /**
     * Construct a CredentialService object (This should not be called directly, and instead should be constructed with createCredentials)
     */
    constructor(dragonchainId, credentials, hmacAlgo) {
        /**
         * Return the HMAC signature used as the Authorization Header on REST requests to your dragonchain.
         */
        this.getAuthorizationHeader = (method, path, timestamp, contentType, body) => {
            const message = CredentialService.getHmacMessageString(method, path, this.dragonchainId, timestamp, contentType, body, this.hmacAlgo);
            const hmac = crypto.createHmac(this.hmacAlgo, this.credentials.authKey);
            const signature = hmac.update(message).digest('base64');
            return `DC1-HMAC-${this.hmacAlgo} ${this.credentials.authKeyId}:${signature}`;
        };
        this.dragonchainId = dragonchainId;
        this.credentials = credentials;
        this.hmacAlgo = hmacAlgo;
    }
}
/**
 * async constructor to return an initialized CredentialService instantiation
 */
CredentialService.createCredentials = (dragonchainId, authKey = '', authKeyId = '', hmacAlgo = 'SHA256', injected = { getDragonchainCredentials: config_service_1.getDragonchainCredentials }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    if (!authKey || !authKeyId) {
        const credentials = yield injected.getDragonchainCredentials(dragonchainId);
        authKey = credentials.authKey;
        authKeyId = credentials.authKeyId;
    }
    return new CredentialService(dragonchainId, { authKey, authKeyId }, hmacAlgo);
});
/**
 * transform a DragonchainRequestObject into a compliant hmac message string
 */
CredentialService.getHmacMessageString = (method, path, dragonchainId, timestamp, contentType, body, hmacAlgo) => {
    const binaryBody = Buffer.from(body || '', 'utf-8');
    const hashedBase64Content = crypto.createHash(hmacAlgo).update(binaryBody).digest('base64');
    return [
        method.toUpperCase(),
        path,
        dragonchainId,
        timestamp,
        contentType,
        hashedBase64Content
    ].join('\n');
};
exports.CredentialService = CredentialService;
