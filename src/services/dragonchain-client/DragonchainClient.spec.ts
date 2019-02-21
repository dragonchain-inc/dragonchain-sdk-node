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

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import { stub, assert, useFakeTimers, match } from 'sinon'
import { DragonchainClient } from './DragonchainClient'
import { ContractRuntime, SmartContractType, CustomContractCreationSchema, ContractCreateCurrencyContract } from 'src/interfaces/DragonchainClientInterfaces'
/**
 * @hidden
 */
const expect = chai.expect
chai.use(sinonChai)
/**
 * @hidden
 */
let fakeTimeStamp
/**
 * @hidden
 */
let fakeTime: string

describe('DragonchainClient', () => {
  describe('#constructor', () => {
    it('returns instance of DragonchainClient', () => {
      const client = new DragonchainClient('banana')
      expect(client instanceof DragonchainClient).to.equal(true)
    })
  })

  describe('.isValidRuntime', () => {
    it('returns true when valid', () => {
      expect(DragonchainClient.isValidRuntime('nodejs6.10')).to.equal(true)
      expect(DragonchainClient.isValidRuntime('nodejs8.10')).to.equal(true)
      expect(DragonchainClient.isValidRuntime('java8')).to.equal(true)
      expect(DragonchainClient.isValidRuntime('python2.7')).to.equal(true)
      expect(DragonchainClient.isValidRuntime('python3.6')).to.equal(true)
      expect(DragonchainClient.isValidRuntime('dotnetcore1.0')).to.equal(true)
      expect(DragonchainClient.isValidRuntime('dotnetcore2.0')).to.equal(true)
      expect(DragonchainClient.isValidRuntime('dotnetcore2.1')).to.equal(true)
      expect(DragonchainClient.isValidRuntime('go1.x')).to.equal(true)
    })
    it('returns false when invalid', () => {
      expect(DragonchainClient.isValidRuntime('derp' as ContractRuntime)).to.equal(false)
    })
  })

  describe('.isValidSmartContractType', () => {
    it('returns true when valid', () => {
      expect(DragonchainClient.isValidSmartContractType('transaction')).to.equal(true)
      expect(DragonchainClient.isValidSmartContractType('cron')).to.equal(true)
    })
    it('returns false when invalid', () => {
      expect(DragonchainClient.isValidSmartContractType('derp' as SmartContractType)).to.equal(false)
    })
  })

  describe('GET', () => {
    let fakeResponseObj
    let fetch: any
    let CredentialService: any
    let logger: any
    let client: DragonchainClient
    let expectedFetchOptions: any
    let fakeResponseText: string

    beforeEach(() => {
      fakeResponseObj = { body: 'fakeResponseBody' }
      fakeResponseText = 'fakeString'
      fetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj), text: stub().resolves(fakeResponseText) })
      CredentialService = { getAuthorizationHeader: stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' }
      logger = { log: stub(), debug: stub() }
      const injected = { logger, CredentialService, fetch }

      client = new DragonchainClient('fakeDragonchainId', true, injected)
      fakeTimeStamp = Date.now()
      useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
      fakeTime = new Date(fakeTimeStamp).toISOString()
      expectedFetchOptions = {
        method: 'GET',
        body: undefined,
        headers: {
          'Content-Type': 'application/json',
          dragonchain: 'fakeDragonchainId',
          Authorization: 'fakeCreds',
          timestamp: fakeTime
        }
      }
    })

    describe('.getStatus', () => {
      it('calls #fetch() with correct params', async () => {
        await client.getStatus()
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/status`, expectedFetchOptions)
      })
    })

    describe('.getTransaction', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'batman-transaction-id'
        await client.getTransaction(id)
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/transaction/${id}`, expectedFetchOptions)
      })
    })

    describe('.setDragonchainId', () => {
      it('allows resetting the dragonchainId', async () => {
        client.setDragonchainId('hotBanana')
        await client.getStatus()
        expectedFetchOptions.headers.dragonchain = 'hotBanana'
        assert.calledWith(fetch, 'https://hotBanana.api.dragonchain.com/status', match({ headers: { dragonchain: 'hotBanana' } }))
      })
    })

    describe('.setEndpoint', () => {
      it('allows setting the endpoint manually', async () => {
        const endpoint = 'https://some.domain.com'
        client.setEndpoint(endpoint)
        await client.getStatus()
        assert.calledWith(fetch, `${endpoint}/status`, expectedFetchOptions)
      })
    })

    describe('.getBlock', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'robin-block-id'
        await client.getBlock(id)
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/block/${id}`, expectedFetchOptions)
      })
    })

    describe('.getSmartContract', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'joker-smartcontract-id'
        await client.getSmartContract(id)
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract/${id}`, expectedFetchOptions)
      })
    })

    describe('.getVerification', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'block_id'
        await client.getVerifications(id)
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/verifications/${id}`, expectedFetchOptions)
      })
    })

    describe('.queryBlocks', () => {
      it('calls #fetch() with correct params', async () => {
        const params = 'banana'
        await client.queryBlocks(params)
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/block?q=${params}&offset=0&limit=10`, expectedFetchOptions)
      })
    })

    describe('.querySmartContracts', () => {
      it('calls #fetch() with correct params', async () => {
        const params = 'banana'
        await client.querySmartContracts(params)
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract?q=${params}&offset=0&limit=10`, expectedFetchOptions)
      })
    })
  })

  describe('POST', () => {
    const fakeResponseObj = { body: 'fakeResponseBody' }
    const fakeResponseText = 'fakeString'
    const fetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj), text: stub().resolves(fakeResponseText) })
    const CredentialService = { getAuthorizationHeader: stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' }
    const logger = { log: stub(), debug: stub() }
    const injected = { logger, CredentialService, fetch }

    const client = new DragonchainClient('fakeDragonchainId', true, injected)
    fakeTimeStamp = Date.now()
    useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
    fakeTime = new Date(fakeTimeStamp).toISOString()
    const expectedFetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        dragonchain: 'fakeDragonchainId',
        Authorization: 'fakeCreds',
        timestamp: fakeTime
      }
    }

    describe('.createTransaction', () => {
      it('calls #fetch() with correct params', async () => {
        const transactionCreatePayload = {
          version: '1',
          txn_type: 'transaction',
          payload: 'hi!' ,
          tag: 'Awesome!'
        }
        await client.createTransaction(transactionCreatePayload)
        const obj = { ...expectedFetchOptions, body: JSON.stringify(transactionCreatePayload) }
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/transaction`, obj)
      })
    })

    describe('.createContract', () => {
      it('create custom contract successfully', async () => {
        const customContractPayload: CustomContractCreationSchema = {
          'version': '2',
          'dcrn': 'SmartContract::L1::Create',
          'name': 'name',
          'sc_type': 'transaction',
          'is_serial': true,
          'custom_environment_variables': { 'banana': 'banana', 'apple': 'banana' },
          'runtime': 'nodejs6.10',
          'code': 'code',
          'origin': 'custom',
          'handler': 'banana'
        }
        await client.createCustomContract(customContractPayload)
        const obj = { ...expectedFetchOptions, body: JSON.stringify(customContractPayload) }
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract/name`, obj)
      })

      it('create library contract successfully', async () => {
        const libraryContractPayload: ContractCreateCurrencyContract = {
          'custom_environment_variables': {
            'addressScheme': 'ethereum',
            'governance': 'ethereum',
            'originWalletAddress': 'string',
            'precision': 2,
            'totalAmount': 10
          },
          'dcrn': 'SmartContract::L1::Create',
          'is_serial': true,
          'libraryContractName': 'currency',
          'name': 'flimflam',
          'origin': 'library',
          'runtime': 'nodejs8.10',
          'sc_type': 'transaction',
          'version': '2'
        }
        await client.createLibraryContract(libraryContractPayload)
        const obj = { ...expectedFetchOptions, body: JSON.stringify(libraryContractPayload) }
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract/flimflam`, obj)
      })

    })

  })

  describe('PUT', () => {
    const fakeResponseObj = { body: 'fakeResponseBody' }
    const fakeResponseText = 'fakeString'
    const fetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj), text: stub().resolves(fakeResponseText) })
    const CredentialService = { getAuthorizationHeader: stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' }
    const logger = { log: stub(), debug: stub() }
    const injected = { logger, CredentialService, fetch }

    const client = new DragonchainClient('fakeDragonchainId', true, injected)
    fakeTimeStamp = Date.now()
    useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
    fakeTime = new Date(fakeTimeStamp).toISOString()
    const expectedFetchOptions = {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        dragonchain: 'fakeDragonchainId',
        Authorization: 'fakeCreds',
        timestamp: fakeTime
      }
    }

    describe('.updateCustomSmartContract', () => {
      it('calls #fetch() with correct params', async () => {
        const name = 'smartContractName'
        const status = 'GrilledCheese'
        const fakeBodyResponse: any = {
          'version': '1',
          'name': name,
          'status': status
        }
        await client.updateCustomSmartContract(name, status)
        const id = 'smartContractName'
        const obj = { ...expectedFetchOptions, body: JSON.stringify(fakeBodyResponse) }
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract/${id}`, obj)
      })
    })

  })

})

/**
 * All Humans are welcome.
 */
