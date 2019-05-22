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

 /**
  * @hidden
  * Supported HTTP methods for the sdk
  */
export type SupportedHTTP = 'GET' | 'POST' | 'PUT' | 'DELETE'

/**
 * @hidden
 * Fetch options used internally
 */
export interface FetchOptions {
  method: SupportedHTTP
  headers: {
    'Content-Type'?: string
    'X-Callback-URL'?: string
    dragonchain: string
    timestamp: string
    Authorization: string
  }
  body: string | undefined
}

/**
 * Response returned from a `DragonchainClient` call to a dragonchain
 */
export interface Response<T> {
  /**
   * Boolean result if the response from the dragonchain was a 2XX status code, indicating a successful call
   */
  ok: boolean,
  /**
   * HTTP status code returned from this call
   */
  status: number,
  /**
   * Responses from Dragonchain will return here.
   *
   * Check the docs for the specific function you are calling to see what will appear here.
   */
  response: T
}

/**
 * Data returned from a query against a chain
 */
export interface QueryResult<T> {
  /**
   * Array of results
   */
  results: T[]
  /**
   * Total count of results that match the query
   *
   * Note this number can be higher than the length of the `results` array,
   * indicating that pagination was used to shorten the `results` returned
   */
  total: number
}

/**
 * Example Transaction At Rest Object
 * @name Transaction::L1::FullTransaction
 * @example
 * ```json
 *
 * {
 *    "version": "1",
 *    "dcrn": "Transaction::L1::FullTransaction",
 *    "header": {
 *      "txn_type": "btcWatcher",
 *      "dc_id": "134376ff-8272-4da0-8523-53b0f60e26eb",
 *      "txn_id": "be3390a3-b76a-4749-9703-22e48a9c5a54",
 *      "block_id": "21500625",
 *      "timestamp": "1539741341",
 *      "tag": "",
 *      "invoker": "37aee185-bd5c-48bc-886e-52c6c9110314"
 *   },
 *   "payload": "",
 *   "proof": {
 *     "full": "r9IjV3Mo3Sd9mWh5cAXxQP4h9tjiIec3Z1/+fI9F218=",
 *     "stripped": "MEUCIQCJLaYXAkm7/VkyrulVTxmUVAfVnOQy5hSYJZG2U7fgIgIgHGJWMoHt7/o/hoIGLqgqiGUc4ESiwMbIyKeJs88KHf4="
 *   }
 * }
 * ```
 */
export interface L1DragonchainTransactionFull {
  /**
   * string representing this Dragonchain Resource Name
   */
  dcrn: 'Transaction::L1::FullTransaction',
  /**
   * string representing the version of this DataTransferObject
   */
  version: string
  header: {
    /**
     * name of a smart contract, or 'transaction'
     */
    txn_type: string,
    /**
     * the dragonchainId which originally received this transaction
     */
    dc_id: string,
    /**
     * the GUID of this transaction
     */
    txn_id: string,
    /**
     * free-form string of search searchable data submitted by the transaction author
     */
    tag: string,
    /**
     * unix timestamp of when this transaction was first processed
     */
    timestamp: string,
    /**
     * the block id to which this transaction was fixated
     */
    block_id: string,
    /**
     * the optional GUID of a smart-contract transaction which triggered this record.
     * SC invocation requests are null here, their output will contain the transaction ID of their invokation request transaction)
     */
    invoker: string
  }
  /**
   * String of payload data for this transaction
   */
  payload: string,
  proof: {
    /**
     * hash of the full transaction
     */
    full: string,
    /**
     * signature of the stripped transaction
     */
    stripped: string
  }
}

export interface DragonchainTransactionCreateResponse {
  transaction_id: string
}

export interface BulkTransactionPayload {
  /**
   * The transaction type to use for this new transaction. This transaction type must already exist on the chain (via `createTransactionType`)
   */
  transactionType: string,
  /**
   * Payload of the transaction. Must be a utf-8 encodable string, or any json object
   */
  payload: string | object,
  /**
   * Tag of the transaction which gets indexed and can be searched on for queries
   */
  tag?: string
}

interface FailedBulkTransactionCreate {
  version: string
  txn_type: string
  payload: string | object
  tag?: string
}

export interface DragonchainBulkTransactionCreateResponse {
  /**
   * Successfully posted transactions
   */
  201: DragonchainTransactionCreateResponse[],
  /**
   * Transactions that failed to post
   */
  400: FailedBulkTransactionCreate[]
}

export interface BitcoinTransactionOutputs {
  scriptPubKey: string,
  value: number
}

export interface PublicBlockchainTransactionResponse {
  signed: string
}

export interface PublicBlockchainAddressListResponse {
  eth_mainnet?: string,
  etc_mainnet?: string,
  eth_ropsten?: string,
  etc_morden?: string,
  btc_mainnet?: string,
  btc_testnet3?: string,
}

export type SmartContractExecutionOrder = 'parallel' | 'serial'

/**
 * Example SmartContract At Rest Object
 * @name SmartContract::L1::AtRest
 * @example
 * ```json
 *
 * {
 *   "dcrn": "SmartContract::L1::AtRest",
 *   "version": "1",
 *   "txn_type": "c1",
 *   "id": "ec3e6dac-da91-4186-9c21-3f996b4462ab",
 *   "status": {
 *     "state": "active",
 *     "msg": "Creation success",
 *     "timestamp": "2019-05-21 20:19:10.519848"
 *   },
 *   "image": "ubuntu:latest",
 *   "auth_key_id": "SC_ELDVFTEQWXCW",
 *   "image_digest": "sha256:9cf55af627c98299a13aac1349936128770bb0ce44b65344779034f52b2a7934",
 *   "cmd": "cat",
 *   "args": [
 *     "-"
 *   ],
 *   "env": {
 *     "STAGE": "dev",
 *     "DRAGONCHAIN_ID": "ec67bbf5-b41e-4526-95fd-6a7c3abdd058",
 *     "SMART_CONTRACT_ID": "ec3e6dac-da91-4186-9c21-3f996b4462ab",
 *     "SMART_CONTRACT_NAME": "c1"
 *   },
 *   "existing_secrets": [
 *     "secret-key",
 *     "auth-key-id"
 *   ],
 *   "cron": null,
 *   "seconds": null,
 *   "execution_order": "parallel"
 * }
 * ```
 */
export interface SmartContractAtRest {
  /**
   * string representing this Dragonchain Resource Name
   */
  dcrn: 'SmartContract::L1::AtRest',
  /**
   * string representing the version of this DataTransferObject
   */
  version: '3',
  /**
   * the name (and also transaction type to invoke) this smart contract
   */
  txn_type: string,
  /**
   * The unique guid identifier for this contract
   */
  id: string,
  /**
   * data about the current status of the smart contract
   */
  status: {
    state: 'active' | 'inactive',
    msg: string,
    timestamp: string
  },
  /**
   * docker image of the smart contract
   */
  image: string,
  /**
   * id of the auth key that is used by the smart contract for communication back with the chain
   */
  auth_key_id: string | null,
  /**
   * docker image pull digest of the deployed smart contract
   */
  image_digest: string | null,
  /**
   * command that is run on execution of the smart contract
   */
  cmd: string,
  /**
   * args passed into the command on execution of the smart contract
   */
  args: string[] | null,
  /**
   * environment variables given to the smart contract
   */
  env: object | null,
  /**
   * array of secret names for this smart contract
   */
  existing_secrets: string[] | null,
  /**
   * cron expression for scheduling automatic execution of the smart contract
   */
  cron: string | null,
  /**
   * number of seconds between automatic executions of the smart contract
   */
  seconds: number | null,
  /**
   * execution order of the contract, whether it gets invoked asap (parallel), or in a single queue (serial)
   */
  execution_order: SmartContractExecutionOrder
}

export interface DragonchainContractCreateResponse {
  success: SmartContractAtRest,
}

export interface L1DragonchainStatusResult {
  /**
   * Level of this dragonchain
   */
  level: string
  /**
   * Cloud that this chain is running in
   */
  cloud: string
  /**
   * URL of the chain
   */
  url: string
  /**
   * Region that this chain is operating in
   */
  region: string
  /**
   * Proof scheme that this chain uses
   */
  scheme: string
  /**
   * Ethereum wallet assigned to this chain
   */
  wallet: string
  /**
   * Hashing algorithm used for blocks on this chain
   */
  hashAlgo: string
  /**
   * Dragonchain version of this chain
   */
  version: string
  /**
   * Encryption algorithm used for blocks on this chain
   */
  encryptionAlgo: string
}

export interface L1BlockAtRest {
  version: '1',
  dcrn: 'Block::L1::AtRest',
  header: {
    dc_id: string,
    block_id: string,
    level: 1
    timestamp: string,
    prev_id: string,
    prev_proof: string
  },
  transactions: string[],
  proof: {
    scheme: string,
    proof: string,
    nonce?: number
  }
}

export interface L2BlockAtRest {
  version: '1'
  dcrn: 'Block::L2::AtRest'
  header: {
    dc_id: string,
    level: 2,
    block_id: string,
    timestamp: string,
    prev_proof: string
  }
  validation: {
    dc_id: string,
    block_id: string,
    stripped_proof: string,
    transactions: string
  }
  proof: {
    scheme: string
    proof: string
    nonce?: number
  }
}

interface L2Proofs {
  dc_id: string
  block_id: string
  proof: string
}

export interface L3BlockAtRest {
  version: '2'
  dcrn: 'Block::L3::AtRest'
  header: {
    dc_id: string,
    current_ddss: string | null
    level: 3,
    block_id: string,
    timestamp: string,
    prev_proof: string
  },
  'l2-Validations': {
    l1_dc_id: string,
    l1_block_id: string,
    l1_proof: string,
    l2_proofs: L2Proofs[]
    ddss: string,
    count: string,
    regions: string[],
    clouds: string[]
  },
  proof: {
    scheme: string,
    proof: string,
    nonce?: number
  }
}

interface L3Validations {
  l3_dc_id: string
  l3_block_id: string
  l3_proof: string
  valid: boolean
}

export interface L4BlockAtRest {
  version: '2'
  dcrn: 'Block::L4::AtRest'
  header: {
    dc_id: string
    current_ddss: string | null
    level: 4
    block_id: string
    timestamp: string
    l1_dc_id: string
    l1_block_id: string
    l1_proof: string
    prev_proof: string
  }
  'l3-Validations': L3Validations[]
  proof: {
    scheme: string
    proof: string
    nonce?: number
  }
}

export interface L5BlockAtRest {
  version: '1'
  dcrn: 'Block::L5::AtRest'
  header: {
    dc_id: string
    current_ddss: string | null
    level: 5
    block_id: string
    timestamp: string
    prev_proof: string
  }
  'l4-blocks': string[]
  proof: {
    scheme: string
    transaction_hash: string[]
    block_last_sent_at: number
    network: string
    proof: string
    nonce?: number
  }
}

export interface Verifications {
  '2': L2BlockAtRest[],
  '3': L3BlockAtRest[],
  '4': L4BlockAtRest[],
  '5': L5BlockAtRest[]
}

export type levelVerifications = L2BlockAtRest[] | L3BlockAtRest[] | L4BlockAtRest[] | L5BlockAtRest[]
export type BlockSchemaType = L1BlockAtRest | L2BlockAtRest | L3BlockAtRest | L4BlockAtRest | L5BlockAtRest

export interface TransactionTypeSimpleResponse {
  success: boolean
}

export interface TransactionTypeListResponse {
  transaction_types: TransactionTypeResponse[]
}

export interface TransactionTypeCustomIndexes {
  key: string,
  path: string
}

export interface TransactionTypeResponse {
  version: '1',
  txn_type: string,
  custom_indexes: TransactionTypeCustomIndexes[],
  contract_id: boolean,
}
