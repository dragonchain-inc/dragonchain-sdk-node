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

export type ContractRuntime = 'nodejs6.10' | 'nodejs8.10' | 'java8' | 'python2.7' | 'python3.6' | 'dotnetcore1.0' | 'dotnetcore2.0' | 'dotnetcore2.1' | 'go1.x'

export interface Response<T> {
  /**
   * Boolean result passed from the fetch library.
   *
   * This can be used to quickly determine if the status code is 2xx.
   */
  ok: boolean,
  /**
   * HTTP Status Code
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
 *   "payload": {},
 *   "proof": {
 *     "full": "r9IjV3Mo3Sd9mWh5cAXxQP4h9tjiIec3Z1/+fI9F218=",
 *     "stripped": "MEUCIQCJLaYXAkm7/VkyrulVTxmUVAfVnOQy5hSYJZG2U7fgIgIgHGJWMoHt7/o/hoIGLqgqiGUc4ESiwMbIyKeJs88KHf4="
 *   }
 * }
 * ```
 * @param string `dcrn` string representing this Dragonchain Resource Name
 * @param string `version` representing the version of this DataTransferObject
 * @param string `header.txn_type` name of a smart contract, or 'transaction'
 * @param string `header.dc_id` the dragonchainId which originally received this transaction
 * @param string `header.txn_id` the GUID of this transaction
 * @param string `header.tag` free-form string of search searchable data submitted by the transaction author
 * @param string `header.timestamp` unix timestamp of when this transaction was first processed
 * @param string `header.block_id` the block id to which this transaction was fixated
 * @param string `header.invoker` the optional GUID of a smart-contract transaction which triggered this record. SC invocation requests are null here, their output will contain the transaction ID of their invokation request transaction)
 * @param string `payload` String of JSON representing the data for this transaction
 * @param string `proof.full` signature of this transaction.
 * @param string `proof.stripped` signature of this transaction.
 * @example Order of proof hashes looks like this:
 * ```javascript
 * proof_full_hash_order = [
 *   "txn_id",
 *   "txn_type",
 *   "dc_id",
 *   "block_id",
 *   "tag",
 *   "invoker",
 *   "timestamp",
 *   "payload"
 * ]
 * proof_stripped_hash_order = [
 *   "txn_id",
 *   "txn_type",
 *   "dc_id",
 *   "block_id",
 *   "tag",
 *   "invoker",
 *   "timestamp"
 * ]
 * ```
 */
export interface L1DragonchainTransactionFull {
  dcrn: 'Transaction::L1::FullTransaction',
  version: string
  header: {
    txn_type: string,
    dc_id: string,
    txn_id: string,
    tag: string,
    timestamp: string,
    block_id: string,
    invoker: string
  }
  payload: string,
  proof: {
    full: string,
    stripped: string
  }
}

export interface DragonchainSearchResult {
  total: Number
  results: L1DragonchainTransactionFull[]
}

export interface DragonchainTransactionCreatePayload {
  version: string
  txn_type: string
  payload: object | string
  tag: string
}

export interface DragonchainBulkTransactions {
  payload: DragonchainTransactionCreatePayload[]
}

export interface DragonchainTransactionCreateResponse {
  transaction_id: string
}

export interface SmartContractAtRest {
  'dcrn': 'SmartContract::L1::AtRest',
  'version': '1' | '2',
  'id': string,
  'name': string,
  'status': 'approved' | 'rejected' | 'pending',
  'custom_environment_variables': object,
  'origin': 'library' | 'custom',
  'runtime': ContractRuntime,
  'sc_type': string,
  'code': string | null,
  's3_bucket': string | null,
  's3_path': string | null,
  'is_serial': boolean | null,
}

export type SmartContractType = 'transaction' | 'cron'

export type SmartContractExecutionOrder = 'parallel' | 'serial'

export type SmartContractDesiredState = 'active' | 'inactive'

export interface ContractCreationSchema {
  'version': '3',
  'dcrn': 'SmartContract::L1::Create',
  'txn_type': string,
  'image'?: string,
  'cmd'?: string,
  'execution_order'?: SmartContractExecutionOrder,
  'desired_state'?: SmartContractDesiredState,
  'args'?: string[],
  'env'?: object,
  'secrets'?: object,
  'seconds'?: number,
  'cron'?: string,
  'auth'?: string,
}

export interface L1DragonchainTransactionQueryResult {
  results: L1DragonchainTransactionFull[]
  total: number
}

export interface DragonnetConfigSchema {
  l2?: number,
  l3?: number,
  l4?: number,
  l5?: number,
  [index: string]: number | undefined
}

export interface DragonchainContractCreateResponse {
  success: 'Contract creation in progress.',
}

export type SupportedHTTP = 'GET' | 'POST' | 'PUT' | 'DELETE'

export interface FetchOptions {
  method: SupportedHTTP
  headers: {
    'Content-Type': string
    dragonchain: string
    timestamp: string
    Authorization: string
  }
  body: string | undefined
}

export interface L1DragonchainStatusResult {
  dragonchainVersion: string
  level: string,
  isUpdateLocked: boolean,
  cloudformationStatus: string,
  cloudformationLastUpdatedTime: string
}

export interface Verifications {
  '2': L2BlockAtRest[],
  '3': L3BlockAtRest[],
  '4': L4BlockAtRest[],
  '5': L5BlockAtRest[]
}

export type levelVerifications = L2BlockAtRest[] | L3BlockAtRest[] | L4BlockAtRest[] | L5BlockAtRest[]
export type BlockSchemaType = L1BlockAtRest | L2BlockAtRest | L3BlockAtRest | L4BlockAtRest | L5BlockAtRest

export interface DragonchainBlockQueryResult {
  results: BlockSchemaType[]
  total: number
}

export interface L1BlockAtRest {
  'version': '2',
  'dcrn': 'Block::L1::AtRest',
  'header': {
    'dc_id': string,
    'block_id': string,
    'level': 1
    'timestamp': string,
    'prev_id': string,
    'prev_proof': string
  },
  'transactions': string[],
  'proof': {
    'scheme': string,
    'proof': string,
    'nonce'?: number
  }
}

export interface L2BlockAtRest {
  'version': '2'
  'dcrn': 'Block::L2::AtRest'
  'header': {
    'dc_id': string,
    'level': 2,
    'block_id': string,
    'timestamp': string,
    'prev_proof': string
  }
  'validation': {
    'dc_id': string,
    'block_id': string,
    'stripped_proof': string,
    'transactions': string
  }
  'proof': {
    'scheme': string
    'proof': string
    'nonce'?: number
  }
}

export interface L3BlockAtRest {
  'version': '2'
  'dcrn': 'Block::L3::AtRest'
  'header': {
    'dc_id': string,
    'level': 3,
    'block_id': string,
    'timestamp': string,
    'prev_proof': string
  },
  'l2-Validations': {
    'l1_dc_id': string,
    'l1_block_id': string,
    'l1_proof': string,
    'ddss': string,
    'count': string,
    'regions': [],
    'clouds': []
  },
  'proof': {
    'scheme': string,
    'proof': string,
    'nonce'?: number
  }
}

export interface L4Validations {
  'l3_dc_id': string,
  'l3_block_id': string,
  'l3_proof': string,
  'valid': boolean
}
export interface L4BlockAtRest {
  'version': '2'
  'dcrn': 'Block::L4::AtRest'
  'header': {
    'dc_id': string,
    'level': 4,
    'block_id': string,
    'timestamp': string,
    'l1_dc_id': string,
    'l1_block_id': string,
    'l1_proof': string,
    'prev_proof': string
  }
  'l3-Validations': L4Validations[]
  'proof': {
    'scheme': string
    'proof': string
    'nonce'?: number
  }
}

export interface L5BlockAtRest {
  'version': '2'
  'dcrn': 'Block::L4::AtRest'
  'header': {
    'dc_id': string
    'level': 5
    'block_id': string
    'timestamp': string
    'prev_proof': string
  }
  'l4-blocks': string[]
  'proof': {
    'scheme': string
    'proof': string
    'nonce'?: number
  }
}

export type precisionRange = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18
export interface ContractCreateCurrencyContract {
  'custom_environment_variables': {
    'addressScheme'?: 'ethereum' | 'bitcoin' | 'dragon' | 'custom',
    'governance'?: 'ethereum' | 'bitcoin' | 'dragon' | 'custom',
    'originWalletAddress': string,
    'precision'?: precisionRange,
    'totalAmount': number
  }
  'dcrn': 'SmartContract::L1::Create',
  'is_serial': true,
  'libraryContractName': 'currency',
  'name': string,
  'origin': 'library',
  'runtime': 'nodejs8.10',
  'sc_type': 'transaction',
  'version': '2'
}

export interface ContractCreateEthereumInterchainWatcher {
  'custom_environment_variables': {
    'address': string,
    'url': string,
    'contract'?: string,
    'tokenContractAddress'?: string,
    'apiKey'?: string,
    'ethereumNetwork': 'classic' | 'ropsten' | 'mainnet' | 'ropsten-infura'
  }
  'dcrn':	'SmartContract::L1::Create',
  'libraryContractName':	'interchainWatcher',
  'name':	string,
  'origin': 'library',
  'runtime': 'nodejs8.10',
  'sc_type': 'cron',
  'version':	'2'
}

export interface ContractCreateNeoInterchainWatcher {
  'custom_environment_variables': {
    'address': string,
    'apiKey'?: string,
    'network': 'neo' | 'testnet'
  }
  'dcrn':	'SmartContract::L1::Create'
  'libraryContractName': 'neoWatcher'
  'name':	string
  'origin':	'library'
  'runtime': 'nodejs8.10'
  'sc_type': 'cron'
  'version': '2'
}

export interface ContractCreateBtcInterchainWatcher {
  'custom_environment_variables': {
    'address': string,
    'apiKey'?: string,
    'network': 'BTC' | 'testnet3'
    'url': string
  }
  'dcrn':	'SmartContract::L1::Create',
  'libraryContractName': 'btcWatcher',
  'name':	string,
  'origin':	'library',
  'runtime': 'nodejs8.10',
  'sc_type': 'cron',
  'version': '2'
}

export interface ContractCreateEthereumPublisher {
  'custom_environment_variables': {
    'authorizationHeader'?: string,
    'network': 'ETH' | 'Ropsten' | 'ETC' | 'Morden' | 'ropsten-infura'
  }
  'dcrn':	'SmartContract::L1::Create',
  'libraryContractName':	'ethereumPublisher',
  'name':	string,
  'origin':	'library',
  'runtime':	'nodejs8.10',
  'sc_type':	'transaction',
  'version':	'2'
}

export interface ContractCreateNeoPublisher {
  'custom_environment_variables': {
    'authorizationHeader'?: string,
    'network': 'NEO' | 'NEOtestnet'
  }
  'dcrn':	'SmartContract::L1::Create',
  'libraryContractName':	'neoPublisher',
  'name':	string,
  'origin':	'library',
  'runtime':	'nodejs8.10',
  'sc_type':	'transaction',
  'version':	'2'
}

export interface ContractCreateBtcPublisher {
  'custom_environment_variables': {
    'authorizationHeader'?: string,
    'network': 'BTC' | 'testnet3'
  }
  'dcrn':	'SmartContract::L1::Create',
  'libraryContractName':	'btcPublisher',
  'name':	string,
  'origin':	'library',
  'runtime':	'nodejs8.10',
  'sc_type':	'transaction',
  'version':	'2'
}

export interface UpdateResponse {
  'success': string
}

export interface CustomIndexStructure {
  'key': string,
  'path': string,
}

export interface TransactionTypeStructure {
  'version'?: string,
  'txn_type'?: string,
  'custom_indexes'?: CustomIndexStructure[],
}

export interface TransactionTypeResponse {
  'version': string,
  'txn_type': string,
  'custom_indexes': CustomIndexStructure[],
  'is_contract': boolean,
}
