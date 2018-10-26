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

import { OverriddenCredentials, FetchOptions } from 'src/interfaces/DragonchainClientInterfaces'

export class DragonchainRequestObject {
  method: string
  dragonchainId: string
  timestamp: string | number
  contentType: string
  url: string
  path: string
  hmacAlgo: string
  version: '1'
  overriddenCredentials?: OverriddenCredentials
  headers: object
  body: any

  constructor (
    path: string,
    dragonchainId: string,
    fetchOptions: FetchOptions
  ) {
    this.version = '1'
    this.method = fetchOptions.method
    this.dragonchainId = dragonchainId
    this.path = path
    this.url = `https://${this.dragonchainId}.api.dragonchain.com${path}`
    this.timestamp = new Date().toISOString()
    this.hmacAlgo = fetchOptions.hmacAlgo || 'sha256' // only sha256 for now
    this.contentType = fetchOptions.contentType || 'application/json'
    this.overriddenCredentials = fetchOptions.overriddenCredentials
    this.headers = fetchOptions.headers
    this.body = fetchOptions.body
  }

  asFetchOptions = () => {
    return {
      method: this.method,
      headers: this.headers,
      body: this.body
    }
  }
}

/**
 * All Humans are welcome.
 */
