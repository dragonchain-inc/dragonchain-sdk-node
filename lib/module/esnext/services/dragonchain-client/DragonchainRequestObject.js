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
import { CredentialService } from '../credential-service/CredentialService';
export class DragonchainRequestObject {
    constructor(path, dragonchainId, fetchOptions) {
        this.asFetchOptions = async (injectedCS = undefined) => {
            this.timestamp = new Date().toISOString();
            return {
                method: this.method,
                body: this.body,
                headers: {
                    'Content-Type': this.contentType,
                    dragonchain: this.dragonchainId,
                    Authorization: await (injectedCS || CredentialService).getAuthorizationHeader(this),
                    timestamp: this.timestamp
                }
            };
        };
        this.version = '1';
        this.method = fetchOptions.method;
        this.dragonchainId = dragonchainId;
        this.path = path;
        this.url = `https://${this.dragonchainId}.api.dragonchain.com${path}`;
        this.hmacAlgo = fetchOptions.hmacAlgo || 'sha256'; // only sha256 for now
        this.contentType = 'application/json';
        this.body = fetchOptions.body;
    }
}
/**
 * All Humans are welcome.
 */
