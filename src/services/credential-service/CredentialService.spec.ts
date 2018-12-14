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

import { expect } from 'chai'
import { CredentialService } from './CredentialService'
import { DragonchainRequestObject } from '../dragonchain-client/DragonchainRequestObject'
import { sandbox } from 'sinon'

describe('CredentialService', () => {
  let dro: any;
  const testBed = sandbox.create();

  afterEach(() => {
    testBed.restore()
  });

  before(() => {
    dro = {
      method: 'GET', // get
      path: '/chain/transaction',
      dragonchainId: 'a dragonchain id',
      timestamp: '12345',
      headers: {},
      body: '',
      contentType: '',
      url: 'http.fake.org',
      hmacAlgo: 'sha256',
      version: '1',
      asFetchOptions: () => ({ method: dro.method, headers: dro.headers, body: dro.body })
    } as DragonchainRequestObject
  })
  describe('.getAuthorizationHeader', () => {

    it('should use overridden creds', async () => {
      dro.overriddenCredentials = { authKey: 'banana1', authKeyId: 'banana2' };
      const spy = testBed.stub(CredentialService, 'getDragonchainCredentials')
      await CredentialService.getAuthorizationHeader(dro)
      spy.neverCalledWith(dro.dragonchainId)
      dro.overriddenCredentials = undefined;
    })
    it('returns expected hmac', async () => {
      const authKey = 'key'
      const authKeyId = 'id'
      testBed.stub(CredentialService, 'getDragonchainCredentials').onFirstCall().returns(Promise.resolve({ authKey, authKeyId }))
      
      const result = await CredentialService.getAuthorizationHeader(dro)
      expect(result).to.equal('DC1-HMAC-SHA256 id:XBzopP+FZkSKZezdNzF0WW1I8E98Fp+q/8AicSk9FqY=')
    })
  })
})
