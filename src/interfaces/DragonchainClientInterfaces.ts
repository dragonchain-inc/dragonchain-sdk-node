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

// enum DragonchainResourceName {
//   Transaction_L1_Search_Index = 'Transaction::L1::SearchIndex',  // What is indexed by ES
//   Transaction_L1_Full = 'Transaction::L1::FullTransaction',  // A transaction containing header, payload and signature
//   Transaction_L1_Queue_Task = 'Transaction::L1::QueueTask',  // A transaction to be enqueued to the transaction processor
//   Transaction_L1_Bulk_Queue_Task = 'Transaction::L1::BulkQueueTask',  // A bulk transaction containing many valid transactions
//   Transaction_L1_Stripped = 'Transaction::L1::Stripped',  // A transaction with header and signature, but no payload

//   Block_L1_Search_Index = 'Block::L1::SearchIndex',  // What is indexed by ES
//   Block_L2_Search_Index = 'Block::L2::SearchIndex',  // What is used to index blocks
//   Block_L3_Search_Index = 'Block::L3::SearchIndex',  // What is used to index blocks
//   Block_L4_Search_Index = 'Block::L4::SearchIndex',  // What is used to index blocks

//   Block_L1_At_Rest = 'Block::L1::AtRest',  // Contains stringified Transaction::L1::Stripped array, what is stored in S3
//   Block_L2_At_Rest = 'Block::L2::AtRest',  // What is stored in S3
//   Block_L3_At_Rest = 'Block::L3::AtRest',  // What is stored in S3
//   Block_L4_At_Rest = 'Block::L4::AtRest',  // What is stored in S3

//   Broadcast_L1_InTransit = 'Broadcast::L1::InTransit',  // Contains stringified Transaction::L1::Stripped array, what is stored in S3
//   Broadcast_L2_InTransit = 'Broadcast::L2::InTransit',
//   Broadcast_L3_InTransit = 'Broadcast::L3::InTransit',
//   Broadcast_L4_InTransit = 'Broadcast::L4::InTransit',

//   Verification_Record_Desired_At_Rest = 'VerificationRecord::Desired::AtRest',  // What is stored as the base record in the Block Verification System Service to indicate a block needs verifications
//   Verification_Record_Sent_At_Rest = 'VerificationRecord::Sent::AtRest',  // What is stored to indicate that a verification request has been sent
//   Verification_Record_Receipt_At_Rest = 'VerificationRecord::Receipt::AtRest',  // What is stored to indicate that a verification receipt has been received

//   SmartContract_L1_At_Rest = 'SmartContract::L1::AtRest',  // What is stored in S3
//   SmartContract_L1_Search_Index = 'SmartContract::L1::SearchIndex',  // What is indexed by ES
//   SmartContract_L1_Create = 'SmartContract::L1::Create',  // Smart contract create
//   SmartContract_L1_Update = 'SmartContract::L1::Update'  // Smart contract update
// }
export type ContractRuntime = 'nodejs6.10' | 'nodejs8.10' | 'java8' | 'python2.7' | 'python3.6' | 'dotnetcore1.0' | 'dotnetcore2.0' | 'dotnetcore2.1' | 'go1.x'

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

export interface CustomContractCreationSchema {
  dcrn?: 'SmartContract::L1::Create'
  version: '2',
  name: string,
  sc_type: 'cron' | 'transaction',
  is_serial: boolean,
  custom_environment_variables?: object,
  runtime: ContractRuntime,
  code: string,
  origin: 'custom'
}

export interface L1DragonchainTransactionQueryResult {
  results: L1DragonchainTransactionFull[]
  total: number
}

export interface LibraryContractCreationSchema {
  dcrn?: 'SmartContract::L1::Create'
  version: '2',
  name: string,
  custom_environment_variables?: object,
  s3_bucket: string,
  s3_path: string,
  origin: 'library'
}
/**
 * ContractCreationSchema
 * Input verification schema
 */
export interface ContractCreationSchema {
  title: string,
  type: object,
  properties: object
}

export interface DragonchainContractCreateResponse {
  body: string,
}

export interface FetchOptions {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE'
  headers: {
    'Content-Type': 'application/json'
    Authorization: string
  }
  body: string,
  hmacAlgo: string,
  contentType: string,
  overriddenCredentials?: OverriddenCredentials
}

export interface OverriddenCredentials {
  authKeyId: string
  authKey: string
}

export interface L1DragonchainStatusResult {
  dragonchainVersion: string
  level: string,
  isUpdateLocked: boolean,
  cloudformationStatus: string,
  cloudformationLastUpdatedTime: string
}
