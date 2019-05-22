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

import { expect } from 'chai'
import { CredentialService } from './CredentialService'

describe('CredentialService', () => {
  let credentialService: CredentialService

  beforeEach(() => {
    credentialService = new CredentialService('testId', { authKey: 'key', authKeyId: 'keyId' }, 'SHA256')
  })

  describe('.createCredentials', () => {
    it('calls and uses getDragonchainCredentials when credentials are not provided', async () => {
      const fakeGetCreds = async () => { return { authKey: 'key', authKeyId: 'keyId' } }
      const dcid = 'dcid'
      const service = await CredentialService.createCredentials(dcid, '', '', 'SHA256', { getDragonchainCredentials: fakeGetCreds })
      expect(service.dragonchainId).to.equal(dcid)
      expect(service.credentials.authKey).to.equal('key')
      expect(service.credentials.authKeyId).to.equal('keyId')
    })
  })

  describe('#constructor', () => {
    it('initializes with correct variables', () => {
      const dcid = 'dcid'
      const key = 'key'
      const keyId = 'keyId'
      const algo = 'SHA256'
      const service = new CredentialService(dcid, { authKey: key, authKeyId: keyId }, algo)
      expect(service.dragonchainId).to.equal(dcid)
      expect(service.credentials.authKey).to.equal(key)
      expect(service.credentials.authKeyId).to.equal(keyId)
      expect(service.hmacAlgo).to.equal(algo)
    })
  })

  describe('#getAuthorizationHeader', () => {
    it('returns expected hmac', () => {
      const result = credentialService.getAuthorizationHeader('GET', '/path', 'timestamp', 'application/json', '')
      expect(result).to.equal('DC1-HMAC-SHA256 keyId:8Bc+h0parZxGeMB9rYzzRUuNxxHSIjGqSD4W/635A9k=')
      const result2 = credentialService.getAuthorizationHeader('POST', '/new_path', 'timestamp', 'application/json', '"body"')
      expect(result2).to.equal('DC1-HMAC-SHA256 keyId:PkVjUxWZr6ST4xh+JxYFZresaFhQbk8sggWqyWv/XkU=')
    })
  })
})

/**
 * All Humans are welcome.
 */
