import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
// import * as fetch from 'node-fetch'
import { DragonchainClient } from '../src/services/dragonchain-client/DragonchainClient'
import { CustomContractCreationSchema, validContractLibraries } from '../src/interfaces/DragonchainClientInterfaces'
// import { assert } from 'chai'
// import { stub, assert, useFakeTimers } from 'sinon'
// import { ContractRuntime, SmartContractType } from 'src/interfaces/DragonchainClientInterfaces'
// import { DragonchainRequestObject } from './DragonchainRequestObject'
// import { Body } from 'node-fetch';

const { expect } = chai
const { assert } = chai
chai.use(sinonChai)
console.log('This is a test of the integration system. APIKEY:', process.env.API_KEY)
let chainID: string = '8ac33f00-e1b2-4729-a21b-005aaddbd3b8'

describe('DragonchainClient', () => {
  let client: DragonchainClient

  beforeEach(() => {
    client = new DragonchainClient(chainID)
  })
  describe('constructor', () => {
    it('returns instance of DragonchainClient', () => {
      const client = new DragonchainClient(chainID)
      expect(client instanceof DragonchainClient).to.equal(true)
    })
  })

  describe('GET', () => {
    it.only('calls getStatus successfully', async () => {
      const result = await client.getStatus()
      expect(result.dragonchainVersion).to.equal('1.2.1')
      expect(result.level).to.equal('1')
      expect(result.isUpdateLocked).to.equal(false)
    })

    it('calls getTransaction successfully', async () => {
      const result = await client.getTransaction('f36236ad-e065-4d27-bd89-b8f627964fc8')
      expect(result.header.txn_id).to.equal('f36236ad-e065-4d27-bd89-b8f627964fc8')
    })

    it('calls queryTransaction with block_id successfully', async () => {
      const result = await client.queryTransactions('block_id:22465874')
      assert.isOk(result)
    //   expect(result.total).to.equal(9)
    })

    it('lists transactions', async () => {
      const result = await client.queryTransactions()
      assert.isOk(result)
    //   expect(result.total).to.equal(9)
    })

    it('calls getBlock successfully', async () => {
      const result = await client.getBlock('22465874')
      expect(result.header.block_id).to.equal('22465874')
    })

    it('calls queryBlocks successfully', async () => {
      const result = await client.queryBlocks('block_id:22465874')
      assert.isOk(result)
    })

    it('calls getSmartContract successfully', async () => {
      const result = await client.getSmartContract('banana')
      expect(result.name).to.equal('banana')
    })
  })

  // describe('PUT', () => {
  //   it('updates SmartContract successfully', async () => {
  //     const result = await client.updateSmartContract('banana', 'banana', 'banana', 'nodejs6.10','nodejs6.10', true, { 'banana': 'apple', 'apple': 'banana' })

  //   })
  // })

  describe('POST', () => { // OK
    it('POST transaction successfully', async () => {
      const payload: any = {
        'version': '1',
        'txn_type': 'apple',
        'tag': 'pottery',
        'payload': {}
      }
      const result = await client.createTransaction(payload)
      expect(result.transaction_id).to.be.a('string')
    })

    describe('.createContract', () => {
      it.only('POST custom contract successfully', async () => {
        const encoded64bit = 'UEsDBBQACAAIAHOP2UwAAAAAAAAAAAAAAAAJABAAY3VzdG9tLnB5VVgMAAaQMVv6jzFb9QEUAGWOwQqDMBBE7/mK3BKh+AFCD7aEIlQFtV5ExNatpDSJmCgtpf/emHpzTrvMzNvlYlCjwQ+tJOL/WWmEUAd33INpQM58VFKANNQLELYawUyjdBX/qdpOU6X9NVeR4yUv0rhhSRllaRKzpGjKMIvCw5nlpPZWtGi5pDBb6g7flDTwMivdgvB+e9p5V9W9rflxyyIiQOu2BxIsvYrELM/DEyO1S3zR5t9uEoOmC8dDP1BLBwjrwgqurgAAAPsAAABQSwMECgAAAAAAfY/ZTAAAAAAAAAAAAAAAAAkAEABfX01BQ09TWC9VWAwADpAxWw6QMVv1ARQAUEsDBBQACAAIAHOP2UwAAAAAAAAAAAAAAAAUABAAX19NQUNPU1gvLl9jdXN0b20ucHlVWAwABpAxW/qPMVv1ARQAY2AVY2dgYmDwTUxW8A9WiFCAApAYAycQGwHxDSAG8hm5GIgCjiEhQRAWWMcFILZCU8IEFRdgYJBKzs/VSywoyEnVy0ksLiktTk1JSSxJVQ4Ihqp9AMRaDAwqCHW5qSWJQDWJVvHZvi6eJam5ocWpRSGJ6cUMDDKRB6JAmi48eCoPopMKcjKLSwwMFnBAXcQINZWRARVwAgBQSwcIHdkVDZgAAAAKAQAAUEsBAhUDFAAIAAgAc4/ZTOvCCq6uAAAA+wAAAAkADAAAAAAAAAAAQKSBAAAAAGN1c3RvbS5weVVYCAAGkDFb+o8xW1BLAQIVAwoAAAAAAH2P2UwAAAAAAAAAAAAAAAAJAAwAAAAAAAAAAED9QfUAAABfX01BQ09TWC9VWAgADpAxWw6QMVtQSwECFQMUAAgACABzj9lMHdkVDZgAAAAKAQAAFAAMAAAAAAAAAABApIEsAQAAX19NQUNPU1gvLl9jdXN0b20ucHlVWAgABpAxW/qPMVtQSwUGAAAAAAMAAwDUAAAAFgIAAAAA'
        let contractNameValue = Math.floor((Math.random() * 10000) + 1)
        let contractName = `baconPoolParty${contractNameValue}`
        const customContractPayload: CustomContractCreationSchema = {
          'version': '2',
          'dcrn': 'SmartContract::L1::Create',
          'name': contractName,
          'sc_type': 'transaction',
          'is_serial': true,
          'custom_environment_variables': {},
          'runtime': 'nodejs6.10',
          'origin': 'Custom',
          'code': encoded64bit
        }
        const result = await client.createCustomContract(customContractPayload)
        expect(result.success).to.equal('Contract creation in progress.')
      }).timeout(10000)

      it('POST Currency contract successfully', async () => {
        let contractNameValue = Math.floor((Math.random() * 10000) + 1)
        let contractName = `baconPoolParty${contractNameValue}`
        const currencyContractPayload: validContractLibraries = {
          'custom_environment_variables': {
            'originWalletAddress': '0x32Be343B94f86jahemcpC4fEe278Fjahsen8C102D88',
            'totalAmount': 50
          },
          'dcrn': 'SmartContract::L1::Create',
          'is_serial': true,
          'libraryContractName': 'currency',
          'name': contractName,
          'origin': 'library',
          'runtime': 'nodejs8.10',
          'sc_type': 'transaction',
          'version': '2'
        }
        const result = await client.createLibraryContract(currencyContractPayload)
        expect(result.success).to.equal('Contract creation in progress.')
      }).timeout(5000)
    })
  })

})
