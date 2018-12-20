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

import { DragonchainRequestObject } from './DragonchainRequestObject'
import * as chai from 'chai'
import { FetchOptions } from 'src/interfaces/DragonchainClientInterfaces'

chai.use(require('chai-match'))
const { expect } = chai
describe('DragonchainRequestObject', () => {
  describe('#constructor', () => {
    it('assigns default instance vars', () => {
      const fetchOptions = { method: 'PUT', body: 'hi!', headers: { 'Content-Type': 'application/json' } } as FetchOptions
      const dro = new DragonchainRequestObject('/chains/contract', 'myDcid', fetchOptions)
      expect(dro.version).to.equal('1')
      expect(dro.url).to.equal('https://myDcid.api.dragonchain.com/chains/contract')
      expect(dro.timestamp).to.equal(undefined)
      expect(dro.body).to.equal('hi!')
      expect(dro.hmacAlgo).to.equal('sha256')
      expect(dro.contentType).to.equal('application/json')
    })
  })
})
