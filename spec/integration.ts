// import * as chai from 'chai'
// import * as sinonChai from 'sinon-chai'
// // import * as fetch from 'node-fetch'
// import { DragonchainClient } from '../src/services/dragonchain-client/DragonchainClient'
// import { CustomContractCreationSchema, LibraryContractCreationSchema } from '../src/interfaces/DragonchainClientInterfaces'
// // import { assert } from 'chai'
// // import { stub, assert, useFakeTimers } from 'sinon'
// // import { ContractRuntime, SmartContractType } from 'src/interfaces/DragonchainClientInterfaces'
// // import { DragonchainRequestObject } from './DragonchainRequestObject'
// // import { Body } from 'node-fetch';

// const { expect } = chai
// const { assert } = chai
// chai.use(sinonChai)
// console.log('This is a test of the integration system. APIKEY:', process.env.API_KEY)
// let chainID: string = 'dd4b399c-7b59-46a8-be42-0ba96baa3679'

// describe('DragonchainClient', () => { // OK
//   describe('constructor', () => {
//     it('returns instance of DragonchainClient', () => {
//       const client = new DragonchainClient(chainID)
//       expect(client instanceof DragonchainClient).to.equal(true)
//     })
//   })

//   describe('GET', () => {
//     let client: DragonchainClient

//     beforeEach(() => {
//       client = new DragonchainClient(chainID)
//     })

//     describe('.getStatus', () => { // OK
//       it('calls getStatus successfully', async () => {
//         const result = await client.getStatus()
//         expect(result.dragonchainVersion).to.equal('1.1.0')
//         expect(result.level).to.equal('1')
//         expect(result.isUpdateLocked).to.equal(false)
//       })
//     })

//     describe('.getTransaction', () => { // OK
//       it('calls getTransaction successfully', async () => {
//         const result = await client.getTransaction('5f6e2620-5fd2-46c3-94eb-71afd1781f0d')
//         expect(result.header.txn_id).to.equal('5f6e2620-5fd2-46c3-94eb-71afd1781f0d')
//       })
//     })

//     describe('.queryTransactions', () => {
//       it('calls queryTransaction successfully', async () => {
//         const result = await client.queryTransactions('903284092384')
//         assert.isOk(result)
//       })
//     })

//     describe('.getBlock', () => { // OK
//       it('calls getBlock successfully', async () => {
//         const result = await client.getBlock('22255459')
//         expect(result.header.block_id).to.equal('22255459')
//       })
//     })

//     describe('.queryBlocks', () => {
//       it('calls queryBlocks successfully', async () => {
//         const result = await client.getBlock('20384203948')
//         assert.isOk(result)
//       })
//     })

//     describe('.getSmartContract', () => {
//       it('calls getSmartContract successfully', async () => {
//         const result = await client.getSmartContract('banana')
//         expect(result.id).to.equal('banana')
//       })
//     })

//     describe('.updateSmartContract', () => {
//       it('updates SmartContract successfully', async () => {
//         const result = await client.updateSmartContract('banana', 'banana', 'banana', 'nodejs6.10','nodejs6.10', true, { 'banana': 'apple', 'apple': 'banana' })
//       })
//     })

//     describe('.createTransaction', () => { // OK
//       it('POST transaction successfully', async () => {
//         const payload: any = {
//           'version': '1',
//           'txn_type': 'apple',
//           'tag': 'pottery',
//           'payload': {}
//         }
//         const result = await client.createTransaction(payload)
//         expect(result.transaction_id).to.be.a('string')
//       })
//     })

//     describe('.createContract', () => {
//       it('POST custom contract successfully', async () => {
//         const customContractPayload: CustomContractCreationSchema = {
//           'version': '2',
//           'dcrn': 'SmartContract::L1::Create',
//           'name': 'banana',
//           'sc_type': 'transaction',
//           'is_serial': true,
//           'custom_environment_variables': {},
//           'runtime': 'nodejs6.10',
//           'origin': 'Custom',
//           'code': ''
//         }
//         const result = await client.createContract(customContractPayload, 'banana')
//         assert.isOk(result)
//       })

//       it('POST library contract successfully', async () => {
//         const libraryContracyPayload: LibraryContractCreationSchema = {
//           'version': '2',
//           'dcrn': 'SmartContract::L1::Create',
//           'name': 'banana',
//           'sc_type': 'transaction',
//           'is_serial': true,
//           'custom_environment_variables': {},
//           'runtime': 'nodejs6.10',
//           'origin': 'Library',
//           'libraryContractName': 'currency'
//         }
//         const result = await client.createContract(libraryContracyPayload, 'banana')
//         assert.isOk(result)
//       })
//     })
//   })
// })
