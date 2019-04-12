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
        'txn_type': 'test',
        'tag': 'pottery',
        'payload': {}
      }
      postTransaction = (await client.createTransaction(payload)).response
      expect(postTransaction.transaction_id).to.be.a('string')
    }).timeout(10000)
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
  })
})
