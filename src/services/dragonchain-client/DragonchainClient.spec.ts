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

import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import { stub, assert } from 'sinon'
import { DragonchainClient } from './DragonchainClient'
import { ContractRuntime, SmartContractType } from 'src/interfaces/DragonchainClientInterfaces'

const { expect } = chai
chai.use(sinonChai)

describe('DragonchainClient', () => {
  describe('constructor', () => {
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
    let fakeFetch: any
    let fakeCredentialService
    let fakeLogger
    let client: DragonchainClient
    let expectedFetchOptions: any

    beforeEach(() => {
      fakeResponseObj = { body: 'fakeResponseBody' }
      fakeFetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj) })
      fakeCredentialService = { getAuthorizationHeader: stub().resolves('fakeCreds') }
      fakeLogger = { log: stub(), debug: stub() }
      client = new DragonchainClient('fakeDragonchainId', true, fakeFetch, fakeCredentialService, fakeLogger)
      expectedFetchOptions = {
        method: 'GET',
        body: undefined,
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'fakeCreds'
        }
      }
    })
    describe('.getTransaction', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'batman-transaction-id'
        await client.getTransaction(id)
        assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/transaction/${id}`, expectedFetchOptions)
      })
    })

    describe('.setDragonchainId', () => {
      it('allows resetting the dragonchainId', async () => {
        const id = 'goo-transaction-id'
        client.setDragonchainId('hotBanana')
        await client.getTransaction(id)
        assert.calledWith(fakeFetch, `https://hotBanana.api.dragonchain.com/transaction/${id}`, expectedFetchOptions)
      })
    })

    describe('.getBlock', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'robin-block-id'
        await client.getBlock(id)
        assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/block/${id}`, expectedFetchOptions)
      })
    })

    describe('.getSmartContract', () => {
      it('calls #fetch() with correct params', async () => {
        const id = 'joker-smartcontract-id'
        await client.getSmartcontract(id)
        assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/smartcontract/${id}`, expectedFetchOptions)
      })
    })
  })

  describe('POST', () => {
    const fakeResponseObj = { body: 'fakeResponseBody' }
    const fakeFetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj) })
    const fakeCredentialService = { getAuthorizationHeader: stub().resolves('fakeCreds') }
    const fakeLogger = { log: stub(), debug: stub() }
    const client = new DragonchainClient('fakeDragonchainId', true, fakeFetch, fakeCredentialService, fakeLogger)
    const expectedFetchOptions = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: 'fakeCreds'
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
        assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/transaction`, obj)
      })
    })
  })

})

/**
 * All Humans are welcome.
 */
