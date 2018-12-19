// /**
//  * Copyright 2018 Dragonchain, Inc. or its affiliates. All Rights Reserved.
//  *
//  * Licensed under the Apache License, Version 2.0 (the "License");
//  * you may not use this file except in compliance with the License.
//  * You may obtain a copy of the License at
//  *
//  *     http://www.apache.org/licenses/LICENSE-2.0
//  *
//  * Unless required by applicable law or agreed to in writing, software
//  * distributed under the License is distributed on an "AS IS" BASIS,
//  * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
//  * See the License for the specific language governing permissions and
//  * limitations under the License.
//  */

// import * as chai from 'chai'
// import * as sinonChai from 'sinon-chai'
// import { stub, assert, useFakeTimers } from 'sinon'
// import { DragonchainClient } from './DragonchainClient'
// import { ContractRuntime, SmartContractType, CustomContractCreationSchema, LibraryContractCreationSchema } from 'src/interfaces/DragonchainClientInterfaces'

// const { expect } = chai
// chai.use(sinonChai)
// let fakeTimeStamp
// let fakeTime: string

// describe('DragonchainClient', () => {
//   describe('constructor', () => {
//     it('returns instance of DragonchainClient', () => {
//       const client = new DragonchainClient('banana')
//       expect(client instanceof DragonchainClient).to.equal(true)
//     })
//   })

//   describe('.isValidRuntime', () => {
//     it('returns true when valid', () => {
//       expect(DragonchainClient.isValidRuntime('nodejs6.10')).to.equal(true)
//       expect(DragonchainClient.isValidRuntime('nodejs8.10')).to.equal(true)
//       expect(DragonchainClient.isValidRuntime('java8')).to.equal(true)
//       expect(DragonchainClient.isValidRuntime('python2.7')).to.equal(true)
//       expect(DragonchainClient.isValidRuntime('python3.6')).to.equal(true)
//       expect(DragonchainClient.isValidRuntime('dotnetcore1.0')).to.equal(true)
//       expect(DragonchainClient.isValidRuntime('dotnetcore2.0')).to.equal(true)
//       expect(DragonchainClient.isValidRuntime('dotnetcore2.1')).to.equal(true)
//       expect(DragonchainClient.isValidRuntime('go1.x')).to.equal(true)
//     })
//     it('returns false when invalid', () => {
//       expect(DragonchainClient.isValidRuntime('derp' as ContractRuntime)).to.equal(false)
//     })
//   })

//   describe('.isValidSmartContractType', () => {
//     it('returns true when valid', () => {
//       expect(DragonchainClient.isValidSmartContractType('transaction')).to.equal(true)
//       expect(DragonchainClient.isValidSmartContractType('cron')).to.equal(true)
//     })
//     it('returns false when invalid', () => {
//       expect(DragonchainClient.isValidSmartContractType('derp' as SmartContractType)).to.equal(false)
//     })
//   })

//   describe('GET', () => {
//     let fakeResponseObj
//     let fakeFetch: any
//     let fakeCredentialService
//     let fakeLogger
//     let client: DragonchainClient
//     let expectedFetchOptions: any

//     beforeEach(() => {
//       fakeResponseObj = { body: 'fakeResponseBody' }
//       fakeFetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj) })
//       fakeCredentialService = { getAuthorizationHeader: stub().resolves('fakeCreds') }
//       fakeLogger = { log: stub(), debug: stub() }
//       client = new DragonchainClient('fakeDragonchainId', true, fakeFetch, fakeCredentialService, fakeLogger)
//       fakeTimeStamp = Date.now()
//       useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
//       fakeTime = new Date(fakeTimeStamp).toISOString()
//       expectedFetchOptions = {
//         method: 'GET',
//         body: undefined,
//         headers: {
//           'Content-Type': 'application/json',
//           dragonchain: 'fakeDragonchainId',
//           Authorization: 'fakeCreds',
//           timestamp: fakeTime
//         }
//       }
//     })

//     describe('.getStatus', () => {
//       it('calls #fetch() with correct params', async () => {
//         await client.getStatus()
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/status`, expectedFetchOptions)
//       })
//     })

//     describe('.getTransaction', () => {
//       it('calls #fetch() with correct params', async () => {
//         const id = 'batman-transaction-id'
//         await client.getTransaction(id)
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/transaction/${id}`, expectedFetchOptions)
//       })
//     })

//     describe('.setDragonchainId', () => {
//       it('allows resetting the dragonchainId', async () => {
//         const id = 'goo-transaction-id'
//         client.setDragonchainId('hotBanana')
//         await client.getTransaction(id)
//         assert.calledWith(fakeFetch, `https://hotBanana.api.dragonchain.com/chains/transaction/${id}`, expectedFetchOptions)
//       })
//     })

//     describe('.getBlock', () => {
//       it('calls #fetch() with correct params', async () => {
//         const id = 'robin-block-id'
//         await client.getBlock(id)
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/block/${id}`, expectedFetchOptions)
//       })
//     })

//     describe('.getSmartContract', () => {
//       it('calls #fetch() with correct params', async () => {
//         const id = 'joker-smartcontract-id'
//         await client.getSmartContract(id)
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/contract/${id}`, expectedFetchOptions)
//       })
//     })

//     describe('.getVerification', () => {
//       it('calls #fetch() with correct params', async () => {
//         const id = 'block_id'
//         await client.getVerification(id)
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/verification/${id}`, expectedFetchOptions)
//       })
//     })

//     describe('.queryBlocks', () => {
//       it('calls #fetch() with correct params', async () => {
//         const params = 'banana'
//         await client.queryBlocks(params)
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/block?q=${params}`, expectedFetchOptions)
//       })
//     })

//     describe('.querySmartContracts', () => {
//       it('calls #fetch() with correct params', async () => {
//         const params = 'banana'
//         await client.querySmartContracts(params)
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/contract?q=${params}`, expectedFetchOptions)
//       })
//     })
//   })

//   describe('POST', () => {
//     const fakeResponseObj = { body: 'fakeResponseBody' }
//     const fakeFetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj) })
//     const fakeCredentialService = { getAuthorizationHeader: stub().resolves('fakeCreds') }
//     const fakeLogger = { log: stub(), debug: stub() }
//     const client = new DragonchainClient('fakeDragonchainId', true, fakeFetch, fakeCredentialService, fakeLogger)
//     fakeTimeStamp = Date.now()
//     useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
//     fakeTime = new Date(fakeTimeStamp).toISOString()
//     const expectedFetchOptions = {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         dragonchain: 'fakeDragonchainId',
//         Authorization: 'fakeCreds',
//         timestamp: fakeTime
//       }
//     }

//     describe('.createTransaction', () => {
//       it('calls #fetch() with correct params', async () => {
//         const transactionCreatePayload = {
//           version: '1',
//           txn_type: 'transaction',
//           payload: 'hi!' ,
//           tag: 'Awesome!'
//         }
//         await client.createTransaction(transactionCreatePayload)
//         const obj = { ...expectedFetchOptions, body: JSON.stringify(transactionCreatePayload) }
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/transaction`, obj)
//       })
//     })

//     describe('.createContract', () => {
//       it('create custom contract successfully', async () => {
//         const customContractPayload: CustomContractCreationSchema = {
//           'version': '2',
//           'dcrn': 'SmartContract::L1::Create',
//           'name': 'name',
//           'sc_type': 'transaction',
//           'is_serial': true,
//           'custom_environment_variables': { 'banana': 'banana', 'apple': 'banana' },
//           'runtime': 'nodejs6.10',
//           'code': 'code',
//           'origin': 'Custom'
//         }
//         await client.createCustomContract(customContractPayload)
//         const obj = { ...expectedFetchOptions, body: JSON.stringify(customContractPayload) }
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/contract`, obj)
//       })

//       it('create library contract successfully', async () => {
//         const libraryContractPayload: LibraryContractCreationSchema = {
//           'custom_environment_variables': {
//             'addressScheme': 'ethereum',
//             'governance': 'ethereum',
//             'originWalletAddress': 'string',
//             'precision': 2,
//             'totalAmount': 10
//           },
//           'dcrn': 'SmartContract::L1::Create',
//           'is_serial': true,
//           'libraryContractName': 'currency',
//           'name': 'string',
//           'origin': 'library',
//           'runtime': 'nodejs8.10',
//           'sc_type': 'transaction',
//           'version': '2'
//         }
//         await client.createLibraryContract(libraryContractPayload)
//         const obj = { ...expectedFetchOptions, body: JSON.stringify(libraryContractPayload) }
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/contract`, obj)
//       })

//     })

//   })

//   describe('PUT', () => {
//     const fakeResponseObj = { body: 'fakeResponseBody' }
//     const fakeFetch = stub().resolves({ status: 200, json: stub().resolves(fakeResponseObj) })
//     const fakeCredentialService = { getAuthorizationHeader: stub().resolves('fakeCreds') }
//     const fakeLogger = { log: stub(), debug: stub() }
//     const client = new DragonchainClient('fakeDragonchainId', true, fakeFetch, fakeCredentialService, fakeLogger)
//     fakeTimeStamp = Date.now()
//     useFakeTimers({ now: fakeTimeStamp, shouldAdvanceTime: false })
//     fakeTime = new Date(fakeTimeStamp).toISOString()
//     const expectedFetchOptions = {
//       method: 'PUT',
//       headers: {
//         'Content-Type': 'application/json',
//         dragonchain: 'fakeDragonchainId',
//         Authorization: 'fakeCreds',
//         timestamp: fakeTime
//       }
//     }

//     describe('.updateCustomSmartContract', () => {
//       it('calls #fetch() with correct params', async () => {
//         const name = 'smartContractName'
//         const status = 'GrilledCheese'
//         const fakeBodyResponse: any = {
//           'name': name,
//           'status': status
//         }
//         await client.updateCustomSmartContract(name, status)
//         const id = 'smartContractName'
//         const obj = { ...expectedFetchOptions, body: JSON.stringify(fakeBodyResponse) }
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/chains/contract/${id}`, obj)
//       })
//     })

//     describe('.updateDragonnetConfig', () => {
//       it('calls #fetch() with correct params', async () => {
//         const maximumPrice = 10
//         const level = 3
//         await client.updateDragonnetConfig(maximumPrice, level)
//       })
//     })

//     describe('.updateDragonnetConfig', () => {
//       it('calls #fetch() with correct params', async () => {
//         const maximumPrice = 10
//         const fakeBody = {
//           'dragonnet': {
//             'l2': {
//               'maximumPrice': maximumPrice
//             }
//           }
//         }
//         await client.updateMatchmakingConfig(maximumPrice)
//         assert.calledWith(fakeFetch, `https://fakeDragonchainId.api.dragonchain.com/update-matchmaking-data`, obj)
//       })
//     })

//   })

// })

// /**
//  * All Humans are welcome.
//  */
