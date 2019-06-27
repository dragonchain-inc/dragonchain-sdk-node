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
import { stub, assert, useFakeTimers } from 'sinon'
import { DragonchainClient } from './DragonchainClient'
import { CredentialService } from '../credential-service/CredentialService'
const expect = chai.expect
chai.use(sinonChai)
let fakeTimeStamp
let fakeTime: string

describe('DragonchainClient', () => {
  describe('#constructor', () => {
    it('returns instance of DragonchainClient', () => {
      const client = new DragonchainClient('banana', new CredentialService('id', { authKey: 'key', authKeyId: 'keyId' }, 'SHA256'), true)
      expect(client instanceof DragonchainClient).to.equal(true)
    })
  })

  describe('GET', () => {
    let fakeResponseObj
    let fetch: any
    let readFileAsync: any
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
      readFileAsync = stub().returns(fakeSecretText)
      CredentialService = { getAuthorizationHeader: stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' }
      logger = { log: stub(), debug: stub() }
      const injected = { logger, fetch, readFileAsync }

      client = new DragonchainClient('fakeUrl', CredentialService, true, injected)
      fakeTimeStamp = Date.now()
      useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
      fakeTime = new Date(fakeTimeStamp).toISOString()
      expectedFetchOptions = {
        method: 'GET',
        body: undefined,
        credentials: 'omit',
        headers: {
          'dragonchain': 'fakeDragonchainId',
          'Authorization': 'fakeCreds',
          'timestamp': fakeTime
        }
      }
    })

    describe('.getSmartContractSecret', () => {
      it('calls readFileAsync with correct dragonchain id and secret name', async () => {
        process.env.SMART_CONTRACT_ID = 'fakeSmartContractId'
        await client.getSmartContractSecret({ secretName: 'fakeSecretName' })
        assert.calledWith(readFileAsync, '/var/openfaas/secrets/sc-fakeSmartContractId-fakeSecretName', 'utf-8')
      })
    })

    describe('.getStatus', () => {
      it('calls #fetch() with correct params', async () => {
        await client.getStatus()
        assert.calledWith(fetch, 'fakeUrl/status', expectedFetchOptions)
      })
    })

    describe('.getApiKey', () => {
      it('calls #fetch() with correct params', async () => {
        await client.getApiKey({ keyId: 'MyKeyID' })
        assert.calledWith(fetch, 'fakeUrl/api-key/MyKeyID', expectedFetchOptions)
      })
    })

    describe('.listApiKeys', () => {
      it('calls #fetch() with correct params', async () => {
        await client.listApiKeys()
        assert.calledWith(fetch, 'fakeUrl/api-key', expectedFetchOptions)
      })
    })

    describe('.getTransaction', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'batman-transaction-id'
        await client.getTransaction({ transactionId: id })
        assert.calledWith(fetch, `fakeUrl/transaction/${id}`, expectedFetchOptions)
      })
    })

    describe('.getBlock', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'robin-block-id'
        await client.getBlock({ blockId: id })
        assert.calledWith(fetch, `fakeUrl/block/${id}`, expectedFetchOptions)
      })
    })

    describe('.getSmartContract', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'joker-smartcontract-id'
        await client.getSmartContract({ smartContractId: id })
        assert.calledWith(fetch, `fakeUrl/contract/${id}`, expectedFetchOptions)
      })
    })

    describe('.getPublicBlockchainAddresses', () => {
      it('calls #fetch() with correct params', async () => {
        await client.getPublicBlockchainAddresses()
        assert.calledWith(fetch, 'fakeUrl/public-blockchain-address', expectedFetchOptions)
      })
    })

    describe('.getVerifications', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'block_id'
        await client.getVerifications({ blockId: id })
        assert.calledWith(fetch, `fakeUrl/verifications/${id}`, expectedFetchOptions)
      })
    })

    describe('.queryBlocks', () => {
      it('calls #fetch() with correct params', async () => {
        const params = 'banana'
        await client.queryBlocks({ luceneQuery: params })
        assert.calledWith(fetch, `fakeUrl/block?q=${params}&offset=0&limit=10`, expectedFetchOptions)
      })
    })

    describe('.querySmartContracts', () => {
      it('calls #fetch() with correct params', async () => {
        const params = 'banana'
        await client.querySmartContracts({ luceneQuery: params })
        assert.calledWith(fetch, `fakeUrl/contract?q=${params}&offset=0&limit=10`, expectedFetchOptions)
      })
    })
  })

  describe('DELETE', () => {
    const fakeResponseObj = { body: 'fakeResponseBody' }
    const fakeResponseText = 'fakeString'
    const fetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj), text: stub().resolves(fakeResponseText) })
    const CredentialService: any = { getAuthorizationHeader: stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' }
    const logger = { log: stub(), debug: stub() }
    const injected = { logger, fetch }
    const client = new DragonchainClient('fakeUrl', CredentialService, true, injected)
    fakeTimeStamp = Date.now()
    useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
    fakeTime = new Date(fakeTimeStamp).toISOString()
    const expectedFetchOptions = {
      method: 'DELETE',
      credentials: 'omit',
      headers: {
        dragonchain: 'fakeDragonchainId',
        Authorization: 'fakeCreds',
        timestamp: fakeTime
      },
      body: undefined
    }

    it('.deleteSmartContract', async () => {
      const param = 'banana'
      await client.deleteSmartContract({ smartContractId: param })
      assert.calledWith(fetch, 'fakeUrl/contract/banana', expectedFetchOptions)
    })

    it('.deleteApiKey', async () => {
      await client.deleteApiKey({ keyId: 'MyKeyID' })
      assert.calledWith(fetch, 'fakeUrl/api-key/MyKeyID', expectedFetchOptions)
    })
  })

  describe('POST', () => {
    const fakeResponseObj = { body: 'fakeResponseBody' }
    const fakeResponseText = 'fakeString'
    const fetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj), text: stub().resolves(fakeResponseText) })
    const CredentialService: any = { getAuthorizationHeader: stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' }
    const logger = { log: stub(), debug: stub() }
    const injected = { logger, CredentialService, fetch }

    const client = new DragonchainClient('fakeUrl', CredentialService, true, injected)
    fakeTimeStamp = Date.now()
    useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
    fakeTime = new Date(fakeTimeStamp).toISOString()
    const expectedFetchOptions = {
      method: 'POST',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'dragonchain': 'fakeDragonchainId',
        'Authorization': 'fakeCreds',
        'timestamp': fakeTime
      }
    }

    describe('.createApiKey', () => {
      it('calls #fetch() with correct params', async () => {
        await client.createApiKey()
        const expectedBody = {}
        assert.calledWith(fetch, 'fakeUrl/api-key', { ...expectedFetchOptions, body: JSON.stringify(expectedBody) })
      })
    })

    describe('.createTransaction', () => {
      it('calls #fetch() with correct params', async () => {
        const transactionCreatePayload = {
          transactionType: 'transaction',
          payload: 'hi!',
          tag: 'Awesome!'
        }
        const expectedBody = {
          version: '1',
          txn_type: transactionCreatePayload.transactionType,
          payload: transactionCreatePayload.payload,
          tag: transactionCreatePayload.tag
        }
        await client.createTransaction(transactionCreatePayload)
        const obj = { ...expectedFetchOptions, body: JSON.stringify(expectedBody) }
        assert.calledWith(fetch, 'fakeUrl/transaction', obj)
      })
    })

    describe('.createSmartContract', () => {
      it('create custom contract successfully', async () => {
        const contractPayload = {
          transactionType: 'name',
          image: 'ubuntu:latest',
          environmentVariables: { 'banana': 'banana', 'apple': 'banana' },
          cmd: 'banana',
          args: ['-m', 'cool']
        }
        const expectedBody = {
          version: '3',
          txn_type: 'name',
          image: contractPayload.image,
          execution_order: 'parallel',
          cmd: contractPayload.cmd,
          args: contractPayload.args,
          env: contractPayload.environmentVariables
        }
        await client.createSmartContract(contractPayload)
        const obj = { ...expectedFetchOptions, body: JSON.stringify(expectedBody) }
        assert.calledWith(fetch, 'fakeUrl/contract', obj)
      })
    })

    describe('.createEthereumTransaction', () => {
      it('calls #fetch() with correct params', async () => {
        const transactionCreatePayload: any = {
          network: 'ETH_MAINNET',
          to: '0x0000000000000000000000000000000000000000',
          value: '0x0',
          data: '0x111',
          gasPrice: '0x222',
          gas: '0x333'
        }
        const expectedBody = {
          network: transactionCreatePayload.network,
          transaction: {
            to: transactionCreatePayload.to,
            value: transactionCreatePayload.value,
            data: transactionCreatePayload.data,
            gasPrice: transactionCreatePayload.gasPrice,
            gas: transactionCreatePayload.gas
          }
        }
        await client.createEthereumTransaction(transactionCreatePayload)
        const obj = { ...expectedFetchOptions, body: JSON.stringify(expectedBody) }
        assert.calledWith(fetch, 'fakeUrl/public-blockchain-transaction', obj)
      })
    })
  })

  describe('PUT', () => {
    const fakeResponseObj = { body: 'fakeResponseBody' }
    const fakeResponseText = 'fakeString'
    const fetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj), text: stub().resolves(fakeResponseText) })
    const CredentialService: any = { getAuthorizationHeader: stub().returns('fakeCreds'), dragonchainId: 'fakeDragonchainId' }
    const logger = { log: stub(), debug: stub() }
    const injected = { logger, CredentialService, fetch }

    const client = new DragonchainClient('fakeUrl', CredentialService, true, injected)
    fakeTimeStamp = Date.now()
    useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
    fakeTime = new Date(fakeTimeStamp).toISOString()
    const expectedFetchOptions = {
      method: 'PUT',
      credentials: 'omit',
      headers: {
        'Content-Type': 'application/json',
        'dragonchain': 'fakeDragonchainId',
        'Authorization': 'fakeCreds',
        'timestamp': fakeTime
      }
    }

    describe('.updateSmartContract', () => {
      it('calls #fetch() with correct params', async () => {
        const smartContractId = '616152367378'
        const status = 'active'
        const fakeBodyResponse: any = {
          'version': '3',
          'desired_state': status
        }
        await client.updateSmartContract({ smartContractId, enabled: true })
        const obj = { ...expectedFetchOptions, body: JSON.stringify(fakeBodyResponse) }
        assert.calledWith(fetch, `fakeUrl/contract/${smartContractId}`, obj)
      })
    })
  })
})

/**
 * All Humans are welcome.
 */
