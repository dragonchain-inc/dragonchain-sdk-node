"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
class DragonchainRequestObject {
    constructor(method, path, body, contentType = 'application/json') {
        this.asFetchOptions = (credService) => {
            const timestamp = new Date().toISOString();
            return {
                method: this.method,
                body: this.body,
                headers: {
                    'Content-Type': this.contentType,
                    dragonchain: credService.dragonchainId,
                    Authorization: credService.getAuthorizationHeader(this.method, this.path, timestamp, this.contentType, this.body),
                    timestamp
                }
            };
        };
        this.method = method;
        this.path = path;
        this.body = body;
        this.contentType = contentType;
    }
}
exports.DragonchainRequestObject = DragonchainRequestObject;
/**
 * All Humans are welcome.
 */
