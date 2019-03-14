import * as chai from 'chai'
import * as sinonChai from 'sinon-chai'
import { DragonchainClient } from '../src/services/dragonchain-client/DragonchainClient'
import { DragonchainTransactionCreateResponse, L1DragonchainTransactionFull } from '../src/interfaces/DragonchainClientInterfaces'
// ContractCreationSchema

const { expect } = chai
const { assert } = chai
chai.use(sinonChai)

function delay (ms: number) {
  return new Promise<void>(function (resolve) {
    setTimeout(resolve, ms)
  })
}

describe('DragonchainClient', () => {
  let client: DragonchainClient
  let postTransaction: DragonchainTransactionCreateResponse
  let getTransaction: L1DragonchainTransactionFull
  let contractName: string
  let secrets = JSON.parse(process.env['INTEGRATION_CREDENTIALS']!)

  beforeEach(() => {
    client = new DragonchainClient(secrets.CHAIN_ID)
    client.overrideCredentials(secrets.AUTH_KEY_ID, secrets.AUTH_KEY)
  })

  describe('POST', () => {
    it('POST transaction successfully', async () => {
      const payload: any = {
        'version': '1',
        'txn_type': 'apple',
        'tag': 'pottery',
        'payload': {}
      }
      postTransaction = (await client.createTransaction(payload)).response
      expect(postTransaction.transaction_id).to.be.a('string')
    }).timeout(10000)

    // describe('.createContract', () => {
    //   it('POST custom contract successfully', async () => {
    //     const encoded64bit = 'UEsDBBQACAAIAHOP2UwAAAAAAAAAAAAAAAAJABAAY3VzdG9tLnB5VVgMAAaQMVv6jzFb9QEUAGWOwQqDMBBE7/mK3BKh+AFCD7aEIlQFtV5ExNatpDSJmCgtpf/emHpzTrvMzNvlYlCjwQ+tJOL/WWmEUAd33INpQM58VFKANNQLELYawUyjdBX/qdpOU6X9NVeR4yUv0rhhSRllaRKzpGjKMIvCw5nlpPZWtGi5pDBb6g7flDTwMivdgvB+e9p5V9W9rflxyyIiQOu2BxIsvYrELM/DEyO1S3zR5t9uEoOmC8dDP1BLBwjrwgqurgAAAPsAAABQSwMECgAAAAAAfY/ZTAAAAAAAAAAAAAAAAAkAEABfX01BQ09TWC9VWAwADpAxWw6QMVv1ARQAUEsDBBQACAAIAHOP2UwAAAAAAAAAAAAAAAAUABAAX19NQUNPU1gvLl9jdXN0b20ucHlVWAwABpAxW/qPMVv1ARQAY2AVY2dgYmDwTUxW8A9WiFCAApAYAycQGwHxDSAG8hm5GIgCjiEhQRAWWMcFILZCU8IEFRdgYJBKzs/VSywoyEnVy0ksLiktTk1JSSxJVQ4Ihqp9AMRaDAwqCHW5qSWJQDWJVvHZvi6eJam5ocWpRSGJ6cUMDDKRB6JAmi48eCoPopMKcjKLSwwMFnBAXcQINZWRARVwAgBQSwcIHdkVDZgAAAAKAQAAUEsBAhUDFAAIAAgAc4/ZTOvCCq6uAAAA+wAAAAkADAAAAAAAAAAAQKSBAAAAAGN1c3RvbS5weVVYCAAGkDFb+o8xW1BLAQIVAwoAAAAAAH2P2UwAAAAAAAAAAAAAAAAJAAwAAAAAAAAAAED9QfUAAABfX01BQ09TWC9VWAgADpAxWw6QMVtQSwECFQMUAAgACABzj9lMHdkVDZgAAAAKAQAAFAAMAAAAAAAAAABApIEsAQAAX19NQUNPU1gvLl9jdXN0b20ucHlVWAgABpAxW/qPMVtQSwUGAAAAAAMAAwDUAAAAFgIAAAAA'
    //     let contractNameValue = Math.floor((Math.random() * 1000000) + 1)
    //     contractName = `baconPoolParty${contractNameValue}`
    //     const customContractPayload: ContractCreationSchema = {
    //       'version': '3',
    //       'dcrn': 'SmartContract::L1::Create',
    //       'name': contractName,
    //       'sc_type': 'transaction',
    //       'is_serial': true,
    //       'custom_environment_variables': {},
    //       'runtime': 'nodejs6.10',
    //       'origin': 'custom',
    //       'code': encoded64bit,
    //       'handler': 'banana.main'
    //     }
    //     const result = (await client.createContract(customContractPayload)).response
    //     expect(result.success).to.not.equal(undefined)
    //   }).timeout(10000)

    // })
  })

  describe('GET', () => {
    it('Wait for the POST request updates to complete', async () => {
      console.log('waiting for the POST updates to complete.....')
      await delay(5000)
    }).timeout(50000)

    it('calls getStatus successfully', async () => {
      const result = (await client.getStatus()).response
      expect(result.level).to.equal('1')
    })

    it('calls getTransaction successfully', async () => {
      getTransaction = (await client.getTransaction(postTransaction.transaction_id)).response
      expect(getTransaction.header.txn_id).to.equal(postTransaction.transaction_id)
    })

    it('calls queryTransaction with block_id successfully', async () => {
      const result = await client.queryTransactions(`block_id=${getTransaction.header.block_id}`)
      assert.isOk(result)
    })

    it('lists transactions', async () => {
      const result = await client.queryTransactions()
      assert.isOk(result)
    }).timeout(5000)

    it('calls getBlock successfully', async () => {
      const result = (await client.getBlock(getTransaction.header.block_id)).response
      expect(result.header.block_id).to.equal(getTransaction.header.block_id)
    })

    it('calls queryBlocks successfully', async () => {
      const result = await client.queryBlocks(`block_id=${getTransaction.header.block_id}`)
      assert.isOk(result)
    })

    it('calls getSmartContract successfully', async () => {
      const result = (await client.getSmartContract(contractName)).response
      expect(result.name).to.equal(contractName)
    })

    it('calls getVerifications successfully', async () => {
      const response = {
        ok: true,
        response: {
          2: [],
          3: [],
          4: [],
          5: []
        },
        status: 200
      }
      const result = await client.getVerifications(getTransaction.header.block_id)
      expect(result).to.eql(response)
    })

    it('calls getVerifications successfully for one level', async () => {
      const response: any = { ok: true, response: [], status: 200 }
      const result = await client.getVerifications(getTransaction.header.block_id, 2)
      expect(result).to.eql(response)
    })
  })

  describe('PUT', () => {
    it('updates metadata in matchmaking config', async () => {
      const result = (await client.updateDragonnetConfig({ l2: 10.123 })).response
      expect(result.success).to.not.equal(undefined)
    })
    // --------------------------------------------------------------------------------------
    // Chain stays in upate state for an inconsistent amount of time
    // --------------------------------------------------------------------------------------
    // it.only('updates SmartContract successfully', async () => {
    //   const result = await client.updateSmartContract('baconPoolParty469380', 'enabled')
    //   assert.isOk(result)
    // })
    // --------------------------------------------------------------------------------------
    // Currently tests are using an L1 chain. This test requires an L2 or higher
    // --------------------------------------------------------------------------------------
    // it('updates metadata in dragonnet config file', async () => {
    //   const result = await client.updateDragonnetConfig(10)
    //   expect(result.success).to.equal('Matchmaking metadata successfully updated')
    // })

  })

})
