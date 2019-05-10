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
import { SmartContractType, ContractCreationSchema } from 'src/interfaces/DragonchainClientInterfaces'
// ContractCreateCurrencyContract
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
    let readFileSync: any
    let CredentialService: any
    let logger: any
    let client: DragonchainClient
    let expectedFetchOptions: any
    let fakeResponseText: string
    let fakeSecretText: string

    beforeEach(() => {
      fakeResponseObj = { body: 'fakeResponseBody' }
      fakeResponseText = 'fakeString'
      fakeSecretText = 'fakeSecret'
      fetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj), text: stub().resolves(fakeResponseText) })
      readFileSync = stub().returns(fakeSecretText)
      CredentialService = { getAuthorizationHeader: stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' }
      logger = { log: stub(), debug: stub() }
      const injected = { logger, CredentialService, fetch, readFileSync }

      client = new DragonchainClient('fakeDragonchainId', true, injected)
      fakeTimeStamp = Date.now()
      useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
      fakeTime = new Date(fakeTimeStamp).toISOString()
      expectedFetchOptions = {
        method: 'GET',
        body: undefined,
        headers: {
          'Content-Type': 'application/json',
          'X-Callback-URL': '',
          'dragonchain': 'fakeDragonchainId',
          'Authorization': 'fakeCreds',
          'timestamp': fakeTime
        }
      }
    })

    describe('.getSecret', () => {
      it('calls readFileSync with correct dragonchain id and secret name', () => {
        process.env.SMART_CONTRACT_ID = 'fakeSmartContractId'
        client.getSecret('fakeSecretName')
        assert.calledWith(readFileSync, '/var/openfaas/secrets/sc-fakeSmartContractId-fakeSecretName', 'utf-8')
      })
    })

    describe('.getStatus', () => {
      it('calls #fetch() with correct params', async () => {
        await client.getStatus()
        assert.calledWith(fetch, 'https://fakeDragonchainId.api.dragonchain.com/status', expectedFetchOptions)
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

    describe('.getPublicBlockchainAddresses', () => {
      it('calls #fetch() with correct params', async () => {
        await client.getPublicBlockchainAddresses()
        assert.calledWith(fetch, 'https://fakeDragonchainId.api.dragonchain.com/public-blockchain-address', expectedFetchOptions)
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

  describe('DELETE', () => {
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
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-Callback-URL': '',
        dragonchain: 'fakeDragonchainId',
        Authorization: 'fakeCreds',
        timestamp: fakeTime
      },
      body: undefined
    }

    it('.deleteSmartContract', async () => {
      const param = 'banana'
      await client.deleteSmartContract(param)
      assert.calledWith(fetch, 'https://fakeDragonchainId.api.dragonchain.com/contract/banana', expectedFetchOptions)
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
        'X-Callback-URL': '',
        'dragonchain': 'fakeDragonchainId',
        'Authorization': 'fakeCreds',
        'timestamp': fakeTime
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
        assert.calledWith(fetch, 'https://fakeDragonchainId.api.dragonchain.com/transaction', obj)
      })
    })

    describe('.createContract', () => {
      it('create custom contract successfully', async () => {
        const contractPayload: ContractCreationSchema = {
          'version': '3',
          'dcrn': 'SmartContract::L1::Create',
          'txn_type': 'name',
          'image': 'ubuntu:latest',
          'execution_order': 'serial',
          'env': { 'banana': 'banana', 'apple': 'banana' },
          'cmd': 'banana',
          'args': ['-m cool']
        }
        await client.createContract(contractPayload)
        const obj = { ...expectedFetchOptions, body: JSON.stringify(contractPayload) }
        assert.calledWith(fetch, 'https://fakeDragonchainId.api.dragonchain.com/contract', obj)
      })
    })

    describe('.createPublicBlockchainTransaction', () => {
      it('calls #fetch() with correct params', async () => {
        const transactionCreatePayload = {
          network: 'ETH_MAINNET',
          transaction: {
            to: '0x0000000000000000000000000000000000000000',
            value: '0x0'
          }
        }
        await client.createPublicBlockchainTransaction(transactionCreatePayload)
        const obj = { ...expectedFetchOptions, body: JSON.stringify(transactionCreatePayload) }
        assert.calledWith(fetch, 'https://fakeDragonchainId.api.dragonchain.com/public-blockchain-transaction', obj)
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
        'X-Callback-URL': '',
        'dragonchain': 'fakeDragonchainId',
        'Authorization': 'fakeCreds',
        'timestamp': fakeTime
      }
    }

    describe('.updateSmartContract', () => {
      it('calls #fetch() with correct params', async () => {
        const txnType = '616152367378'
        const status = 'active'
        const fakeBodyResponse: any = {
          'version': '3',
          'dcrn': 'SmartContract::L1::Update',
          'desired_state': status
        }
        await client.updateSmartContract(txnType, undefined, undefined, undefined, status)
        const id = '616152367378'
        const obj = { ...expectedFetchOptions, body: JSON.stringify(fakeBodyResponse) }
        assert.calledWith(fetch, `https://fakeDragonchainId.api.dragonchain.com/contract/${id}`, obj)
      })
    })

  })

})

/**
 * All Humans are welcome.
 */
