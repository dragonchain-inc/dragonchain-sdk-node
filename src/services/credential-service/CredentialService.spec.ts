import { expect } from 'chai'
import { CredentialService } from './CredentialService'
import { DragonchainRequestObject } from '../dragonchain-client/DragonchainRequestObject'
import { stub } from 'sinon'

describe('CredentialService', () => {
  describe('.getAuthorizationHeader', () => {
    it('returns expected hmac', async () => {
      const authKey = 'key'
      const authKeyId = 'id'
      stub(CredentialService, 'getDragonchainCredentials').onFirstCall().returns(Promise.resolve({ authKey, authKeyId }))
      const dro = {
        method: 'GET', // get
        path: '/chain/transaction',
        dragonchainId: 'a dragonchain id',
        timestamp: 12345,
        headers: {},
        body: '',
        contentType: '',
        url: 'http.fake.org',
        hmacAlgo: 'sha256',
        version: '1',
        asFetchOptions: () => ({ method: dro.method, headers: dro.headers, body: dro.body })
      } as DragonchainRequestObject
      const result = await CredentialService.getAuthorizationHeader(dro)
      expect(result).to.equal('DC1-HMAC-SHA256 id:XBzopP+FZkSKZezdNzF0WW1I8E98Fp+q/8AicSk9FqY=')
    })
  })
})
