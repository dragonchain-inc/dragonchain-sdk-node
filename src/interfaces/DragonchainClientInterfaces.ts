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
export type SupportedHTTP = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * @hidden
 * Fetch options used internally
 */
export interface FetchOptions {
  method: SupportedHTTP;
  headers: {
    'Content-Type'?: string;
    'X-Callback-URL'?: string;
    dragonchain: string;
    timestamp: string;
    Authorization: string;
  };
  body: string | undefined;
  credentials?: string;
}

/**
 * Response returned from a `DragonchainClient` call to a dragonchain
 */
export interface Response<T> {
  /**
   * Boolean result if the response from the dragonchain was a 2XX status code, indicating a successful call
   */
  ok: boolean;
  /**
   * HTTP status code returned from this call
   */
  status: number;
  /**
   * Responses from Dragonchain will return here.
   *
   * Check the docs for the specific function you are calling to see what will appear here.
   */
  response: T;
}

/**
 * Data returned from a query against a chain
 */
export interface QueryResult<T> {
  /**
   * Array of results
   */
  results: T[];
  /**
   * Total count of results that match the query
   *
   * Note this number can be higher than the length of the `results` array,
   * indicating that pagination was used to shorten the `results` returned
   */
  total: number;
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
  dcrn: 'Transaction::L1::FullTransaction';
  /**
   * string representing the version of this DataTransferObject
   */
  version: string;
  header: {
    /**
     * name of a smart contract, or 'transaction'
     */
    txn_type: string;
    /**
     * the dragonchainId which originally received this transaction
     */
    dc_id: string;
    /**
     * the GUID of this transaction
     */
    txn_id: string;
    /**
     * free-form string of search searchable data submitted by the transaction author
     */
    tag: string;
    /**
     * unix timestamp of when this transaction was first processed
     */
    timestamp: string;
    /**
     * the block id to which this transaction was fixated
     */
    block_id: string;
    /**
     * the optional GUID of a smart-contract transaction which triggered this record.
     * SC invocation requests are null here, their output will contain the transaction ID of their invokation request transaction)
     */
    invoker: string;
  };
  /**
   * String of payload data for this transaction
   */
  payload: string;
  proof: {
    /**
     * hash of the full transaction
     */
    full: string;
    /**
     * signature of the stripped transaction
     */
    stripped: string;
  };
}

/**
 * @example
 * ```json
 *
 * {
 *   "transaction_id": "487d6646-a988-40f0-bfee-3dba013fbc2c"
 * }
 * ```
 */
export interface DragonchainTransactionCreateResponse {
  transaction_id: string;
}

export interface BulkTransactionPayload {
  /**
   * The transaction type to use for this new transaction. This transaction type must already exist on the chain (via `createTransactionType`)
   */
  transactionType: string;
  /**
   * Payload of the transaction. Must be a utf-8 encodable string, or any json object
   */
  payload?: string | object;
  /**
   * Tag of the transaction which gets indexed and can be searched on for queries
   */
  tag?: string;
}

interface FailedBulkTransactionCreate {
  version: string;
  txn_type: string;
  payload: string | object;
  tag?: string;
}

export interface DragonchainBulkTransactionCreateResponse {
  /**
   * Successfully posted transactions
   */
  201: DragonchainTransactionCreateResponse[];
  /**
   * Transactions that failed to post
   */
  400: FailedBulkTransactionCreate[];
}

export interface BitcoinTransactionOutputs {
  scriptPubKey: string;
  value: number;
}

/**
 * Example response for createEthereumTransaction
 * @example
 * ```json
 *
 * {
 *   "signed": "0xf86380844160997982ea6094558c01dd95335749a29d040b24a183d8f7637bc880802aa05555e1cc2acd2543c3408855dea997678feaecdd66c2df1591109f43d4a7fc10a04594fe1c321f8dd344b5e7be43b2f58265d78d908a7520add57df0f31c69bc85"
 * }
 * ```
 */
export interface PublicBlockchainTransactionResponse {
  signed: string;
}

/**
 * @example
 * ```json
 *
 * {
 *   "key": "d5K20n1VfHZYIgk55UdJO0bTyMTnjasdGkNyg66ASnd",
 *   "id": "PDJSYJNBTDBP",
 *   "registration_time": 1548604295,
 *   "nickname": "key1"
 * }
 * ```
 */
export interface CreateAPIKeyResponse {
  key: string;
  id: string;
  registration_time: number;
  nickname: string;
  root?: boolean;
}

/**
 * @example
 * ```json
 *
 * {
 *   "success": true
 * }
 * ```
 */
export interface DeleteAPIKeyResponse {
  success: boolean;
}

/**
 * @example
 * ```json
 *
 * {
 *   "id": "PDJSYJNBTDBP",
 *   "registration_time": 1548604295
 * }
 * ```
 */
export interface GetAPIKeyResponse {
  id: string;
  registration_time: number;
  nickname?: string;
}

/**
 * @example
 * ```json
 *
 * {
 *   "keys": [
 *      {
 *         "id": "PDJSYJNBTDBP",
 *         "registration_time": 1548604295
 *      }, ...
 *   ]
 * }
 * ```
 */
export interface ListAPIKeyResponse {
  keys: GetAPIKeyResponse[];
}

/**
 * @example
 * ```json
 *
 * {
 *   "eth_mainnet": "0xa5C32bE6323Cd5E2BC87468F5F2D91849cDb3A3D",
 *   "eth_ropsten": "0x558c01dd95335749a29D040b24a183D8f7637BC8",
 *   "etc_mainnet": "0xf7A802DB95D783254A1f29F47785BA080daBF1db",
 *   "etc_morden": "0x5dd0ac246B54f0267Ee4f33a074382D19AD0fa66",
 *   "btc_mainnet": "17eK35gAem9Pezzs1RdntsoK9kK8dsF7DQ",
 *   "btc_testnet3": "mrgFVPYFMojNsx3gih84PSbQCDiB4rnoQJ"
 * }
 * ```
 */
export interface PublicBlockchainAddressListResponse {
  eth_mainnet?: string;
  etc_mainnet?: string;
  eth_ropsten?: string;
  etc_morden?: string;
  btc_mainnet?: string;
  btc_testnet3?: string;
}

export type SmartContractExecutionOrder = 'parallel' | 'serial';

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
  dcrn: 'SmartContract::L1::AtRest';
  /**
   * string representing the version of this DataTransferObject
   */
  version: '3';
  /**
   * the name (and also transaction type to invoke) this smart contract
   */
  txn_type: string;
  /**
   * The unique guid identifier for this contract
   */
  id: string;
  /**
   * data about the current status of the smart contract
   */
  status: {
    state: 'active' | 'inactive';
    msg: string;
    timestamp: string;
  };
  /**
   * docker image of the smart contract
   */
  image: string;
  /**
   * id of the auth key that is used by the smart contract for communication back with the chain
   */
  auth_key_id: string | null;
  /**
   * docker image pull digest of the deployed smart contract
   */
  image_digest: string | null;
  /**
   * command that is run on execution of the smart contract
   */
  cmd: string;
  /**
   * args passed into the command on execution of the smart contract
   */
  args: string[] | null;
  /**
   * environment variables given to the smart contract
   */
  env: object | null;
  /**
   * array of secret names for this smart contract
   */
  existing_secrets: string[] | null;
  /**
   * cron expression for scheduling automatic execution of the smart contract
   */
  cron: string | null;
  /**
   * number of seconds between automatic executions of the smart contract
   */
  seconds: number | null;
  /**
   * execution order of the contract, whether it gets invoked asap (parallel), or in a single queue (serial)
   */
  execution_order: SmartContractExecutionOrder;
}

/**
 * Example of the status result
 * @example
 * ```json
 *
 * {
 *   "id": "23UeELiu8WDM7iVtvFqNbBJTt29xFS3J53zX5ZJTiRyob",
 *   "level": 1,
 *   "url": "https://d3cabac3-e30d-4bb9-aeed-1fc8cbd38c66.api.dragonchain.com",
 *   "scheme": "trust",
 *   "hashAlgo": "blake2b",
 *   "version": "3.3.1",
 *   "encryptionAlgo": "secp256k1"
 * }
 * ```
 */
export interface L1DragonchainStatusResult {
  /**
   * Public id of the dragonchain
   */
  id: string;
  /**
   * Level of this dragonchain (as an integer)
   */
  level: number;
  /**
   * URL of the chain
   */
  url: string;
  /**
   * Proof scheme that this chain uses
   */
  scheme: string;
  /**
   * Hashing algorithm used for blocks on this chain
   */
  hashAlgo: string;
  /**
   * Dragonchain version of this chain
   */
  version: string;
  /**
   * Encryption algorithm used for blocks on this chain
   */
  encryptionAlgo: string;
}

/**
 * Example L1 Block At Rest Object
 * @name Block::L1::AtRest
 * @example
 * ```json
 *
 * {
 *   "version": "1",
 *   "dcrn": "Block::L1::AtRest",
 *   "header": {
 *     "dc_id": "28VhSgtPhwkhKBgmQSW6vrsir7quEYHdCjqsW6aAYbfrw",
 *     "block_id": "25261901",
 *     "level": 1,
 *     "timestamp": "1558547725",
 *     "prev_id": "25261892",
 *     "prev_proof": "MEUCIQCa8Ps0uV56BnE84hkl3HywSxCmkTIWqWVrMfilryhhjgIgdpwC2s0n5trRXI8yCsYItX173KHiyaSIjczw1pM1w24="
 *   },
 *   "transactions": [
 *     "{\"version\": \"2\", \"dcrn\": \"Transaction::L1::Stripped\", \"header\": {\"txn_type\": \"c1\", \"dc_id\": \"28VhSgtPhwkhKBgmQSW6vrsir7quEYHdCjqsW6aAYbfrw\", \"txn_id\": \"77b902ff-5900-432a-a507-93ba097446fa\", \"block_id\": \"25261901\", \"timestamp\": \"1558547724\", \"tag\": \"\", \"invoker\": \"cron\"}, \"proof\": {\"full\": \"FIF2mF2fS7Ihcq1B/KjU/WcOZQ5vu/9C/SJVnReAsEc=\", \"stripped\": \"MEUCIQDVwWctm4CFiTJdkGkY6fG/rM+B1gBwxavm9ws0OSpLHQIgYp/ucEZUa0Vk/Tw/qyI14HyNTyHzLoKp8XsJLq2GXVY=\"}}"
 *   ],
 *   "proof": {
 *     "scheme": "trust",
 *     "proof": "MEQCICfhDVHOjVN6aexzimxn18+6IBhYg05/5YXadhm5+9GVAiA+BqW0kVfeJEESiiT4WqEH1vT7K0F6xnnwRcbM7cgasQ=="
 *   }
 * }
 * ```
 */
export interface L1BlockAtRest {
  version: '1';
  dcrn: 'Block::L1::AtRest';
  header: {
    dc_id: string;
    block_id: string;
    level: 1;
    timestamp: string;
    prev_id: string;
    prev_proof: string;
  };
  transactions: string[];
  proof: {
    scheme: string;
    proof: string;
    nonce?: number;
  };
}

/**
 * Example L2 Block At Rest Object
 * @name Block::L2::AtRest
 * @example
 * ```json
 *
 * {
 *    "version": "1",
 *    "dcrn": "Block::L2::AtRest",
 *    "header": {
 *      "dc_id": "e7rBQ3CP2Q93wmwQcH6VKzTiRUsAHoGh8fRvxnvx7M31",
 *      "current_ddss": "5484875.54508316",
 *      "level": 2,
 *      "block_id": "44192",
 *      "timestamp": "1555830009",
 *      "prev_proof": "MEQCIBjCggGtfMbra7RYlmNxiGReGHB7Y+6yM56/s73tRCymAiBlySM+yxwKBvBvNpR3FXucCbQYRdciQPGKEThv2E3Q4Q=="
 *    },
 *    "validation": {
 *      "dc_id": "28VhSgtPhwkhKBgmQSW6vrsir7quEYHdCjqsW6aAYbfrw",
 *      "block_id": "24718321",
 *      "stripped_proof": "MEUCIQC3Boti9Sh+nECPvG0Y4dg+h/8GgVF6HmJZcEujUwlDEwIgRClM/01rejnGDbfmFS4VUhOUzMYDr+Pdo02B9Xwf/u8=",
 *      "transactions": "{\"358da848-4cd5-45ff-a776-6d1af52cb972\": true}"
 *    },
 *    "proof": {
 *      "scheme": "trust",
 *      "proof": "MEQCIHDm8ecCpHUf6/cJ05xhIGKdOJBWP0pdLgILnqcvM+BCAiALVMKFdsNHw4IBgzsiOp8lRPizV88jklQNuMnSyLKhkQ=="
 *    }
 *  }
 * ```
 */
export interface L2BlockAtRest {
  version: '1';
  dcrn: 'Block::L2::AtRest';
  header: {
    dc_id: string;
    current_ddds: string | null;
    level: 2;
    block_id: string;
    timestamp: string;
    prev_proof: string;
  };
  validation: {
    dc_id: string;
    block_id: string;
    stripped_proof: string;
    transactions: string;
  };
  proof: {
    scheme: string;
    proof: string;
    nonce?: number;
  };
}

interface L2Proofs {
  dc_id: string;
  block_id: string;
  proof: string;
}

/**
 * Example L3 Block At Rest Object
 * @name Block::L3::AtRest
 * @example
 * ```json
 *
 * {
 *   "version": "2",
 *   "dcrn": "Block::L3::AtRest",
 *   "header": {
 *     "dc_id": "nGfVFAKSUrdC7UrfzuBKErx7rKGwoPRuaFWQa8hrZcFs",
 *     "current_ddss": "1856875.54502316",
 *     "level": 3,
 *     "block_id": "56",
 *     "timestamp": "1557436010",
 *     "prev_proof": "MEUCIQCx67WNIzUmzwtS+0PH3cWzIvzJYIgzvl8kN1nWk6S+RQIgIkuTpB1BMS8Lto6sPRbWhjUbc5AGm3W8Kcb77PgPTEk="
 *   },
 *   "l2-validations": {
 *     "l1_dc_id": "28VhSgtPhwkhKBgmQSW6vrsir7quEYHdCjqsW6aAYbfrw",
 *     "l1_block_id": "25039557",
 *     "l1_proof": "MEUCIQDtq1SPpP4Rx6c3ivI8DZqdIVbXkzNYlq1Wy/8XBnavIQIgQ16eV3Fm65mI3RKTdtDQZUMeOKSBfxFzM9/LRrndYi0=",
 *     "l2_proofs": [
 *       {
 *         "dc_id": "e7rBQ3CP2Q93wmwQcH6VKzTiRUsAHoGh8fRvxnvx7M31",
 *         "block_id": "186183",
 *         "proof": "MEQCIBVx8UXqi1SOz0gVyQQ/AGZO0z/4K/3IF9HzerIdSrTEAiB5K8NsQXnFoRiPcPGxcKyrfmvp0j3zJhTRHAwiXxED6Q=="
 *       }
 *     ],
 *     "ddss": "0",
 *     "count": "1",
 *     "regions": [
 *       "us-west-2"
 *     ],
 *     "clouds": [
 *       "aws"
 *     ]
 *   },
 *   "proof": {
 *     "scheme": "trust",
 *     "proof": "MEUCIQDJkRS++nb8m0vVMfH/QsGssLsMn9J8e8Qd9jj+50P8pQIgG2MjJkGCbhXew0PTc+h3yk47m05btsVtw7vhV6olHfw="
 *   }
 * }
 * ```
 */
export interface L3BlockAtRest {
  version: '2';
  dcrn: 'Block::L3::AtRest';
  header: {
    dc_id: string;
    current_ddss: string | null;
    level: 3;
    block_id: string;
    timestamp: string;
    prev_proof: string;
  };
  'l2-Validations': {
    l1_dc_id: string;
    l1_block_id: string;
    l1_proof: string;
    l2_proofs: L2Proofs[];
    ddss: string;
    count: string;
    regions: string[];
    clouds: string[];
  };
  proof: {
    scheme: string;
    proof: string;
    nonce?: number;
  };
}

interface L3Validations {
  l3_dc_id: string;
  l3_block_id: string;
  l3_proof: string;
  valid: boolean;
}

/**
 * Example L4 Block At Rest Object
 * @name Block::L4::AtRest
 * @example
 * ```json
 *
 * {
 *   "version": "2",
 *   "dcrn": "Block::L4::AtRest",
 *   "header": {
 *     "dc_id": "sCXTCajomLiDxuU6j18UfMdNLYohgJ7SwmF3WgCGZ9v2",
 *     "current_ddss": "1189586.16584187",
 *     "level": 4,
 *     "block_id": "1337",
 *     "timestamp": "1555056367",
 *     "l1_dc_id": "28VhSgtPhwkhKBgmQSW6vrsir7quEYHdCjqsW6aAYbfrw",
 *     "l1_block_id": "24563621",
 *     "l1_proof": "MEQCIHHn/1gCCY5DqkCRo8ZJbZeru+MWkXl0GpbR05Ejx7t+AiANd5M0EWzIneQrX0PP4mGiykGkof60e0r6i09hKF84vA==",
 *     "prev_proof": "MEUCIQCjmrzAWBDpKnLbD83lrv+eVkLhWFBntcFCrfzr+C473QIgNIEvSrIK6LFRbXkDnpWcss0TOlO+JhcJU8jF1eiVsGw="
 *   },
 *   "l3-validations": [
 *     {
 *       "l3_dc_id": "nGfVFAKSUrdC7UrfzuBKErx7rKGwoPRuaFWQa8hrZcFs",
 *       "l3_block_id": "3212",
 *       "l3_proof": "MEUCIQDkVyFbjbazUvWMpn+Ca0Q+XVYyFfwxEfc1qp7fGK0vAgIgQII9Wb79DpLsV9wG/5BnNQF132Z+MgCZL9SyC/ONmr0=",
 *       "valid": true
 *     }
 *   ],
 *   "proof": {
 *     "scheme": "trust",
 *     "proof": "MEUCIQDih7ldBKtdltCkiEe1KV8U5+XXaeQ+gUUMR9okqNbz0wIgGnxFEpwQYcB70nOx/972PWC0G+7n2soCkCdvG4jveZY="
 *   }
 * }
 * ```
 */
export interface L4BlockAtRest {
  version: '2';
  dcrn: 'Block::L4::AtRest';
  header: {
    dc_id: string;
    current_ddss: string | null;
    level: 4;
    block_id: string;
    timestamp: string;
    l1_dc_id: string;
    l1_block_id: string;
    l1_proof: string;
    prev_proof: string;
  };
  'l3-Validations': L3Validations[];
  proof: {
    scheme: string;
    proof: string;
    nonce?: number;
  };
}

/**
 * Example L5 Block At Rest Object
 * @name Block::L5::AtRest
 * @example
 * ```json
 *
 * {
 *   "version": "1",
 *   "dcrn": "Block::L5::AtRest",
 *   "header": {
 *     "dc_id": "x9RLJC7pZW1QLCsQAWYsBLSKMXG7sAVNg9Bo9BJxDuB5",
 *     "current_ddss": "698453.15864657,
 *     "level": 5,
 *     "block_id": "3848",
 *     "timestamp": "1557649020",
 *     "prev_proof": "MEQCIHcpCbcYKGFq++zHB3RsQAC1PZ+wYAZWr/KLMv8WxQEuAiAlRyPYPzJOfu3ivZfwWIy/+dYDKuXxCvrnoI7biBvkBw=="
 *   },
 *   "l4-blocks": [
 *     "{\"l1_dc_id\": \"28VhSgtPhwkhKBgmQSW6vrsir7quEYHdCjqsW6aAYbfrw\", \"l1_block_id\": \"24563150\", \"l4_dc_id\": \"sCXTCajomLiDxuU6j18UfMdNLYohgJ7SwmF3WgCGZ9v2\", \"l4_block_id\": \"1209\", \"l4_proof\": \"MEUCIQCgYcj/nht2BImgomi9KVae33Eb2xAFwFAhAnN/PyfzPAIgIIZbRscNi4TvvSYXrs4PtN4eRuVE1c5LjU9be7hmBT4=\"}"
 *   ],
 *   "proof": {
 *     "scheme": "trust",
 *     "transaction_hash": [
 *       "19691d2f876738e2329f8546669a184cbfa74549ec7057bb797fd85e4a2bc702"
 *     ],
 *     "block_last_sent_at": 1515332,
 *     "network": "testnet3",
 *     "proof": "MEQCICL13yYHYc1F7mkd00SEoYT6OSMQvKPO27R4lVZSGe7gAiBFRBBhjXQiOih3uHMqqRdF0D0S41IKfg+JpwKICE4dJw=="
 *   }
 * }
 * ```
 */
export interface L5BlockAtRest {
  version: '1';
  dcrn: 'Block::L5::AtRest';
  header: {
    dc_id: string;
    current_ddss: string | null;
    level: 5;
    block_id: string;
    timestamp: string;
    prev_proof: string;
  };
  'l4-blocks': string[];
  proof: {
    scheme: string;
    transaction_hash: string[];
    block_last_sent_at: number;
    network: string;
    proof: string;
    nonce?: number;
  };
}

export interface Verifications {
  '2': L2BlockAtRest[];
  '3': L3BlockAtRest[];
  '4': L4BlockAtRest[];
  '5': L5BlockAtRest[];
}

export type levelVerifications = L2BlockAtRest[] | L3BlockAtRest[] | L4BlockAtRest[] | L5BlockAtRest[];
export type BlockSchemaType = L1BlockAtRest | L2BlockAtRest | L3BlockAtRest | L4BlockAtRest | L5BlockAtRest;

/**
 * @example
 * ```json
 *
 * {
 *   "success": true
 * }
 * ```
 */
export interface SimpleResponse {
  success: boolean;
}

/**
 * @example
 * ```json
 *
 * {
 *   "transaction_types": [
 *     {
 *       "version": "1",
 *       "txn_type": "example",
 *       "custom_indexes": [
 *         {
 *           "key": "someKey",
 *           "path": "someJsonPath"
 *         }
 *       ],
 *       "contract_id": false
 *     }
 *   ]
 * }
 * ```
 */
export interface TransactionTypeListResponse {
  transaction_types: TransactionTypeResponse[];
}

export interface TransactionTypeCustomIndex {
  key: string;
  path: string;
}

/**
 * @example
 * ```json
 *
 * {
 *   "version": "1",
 *   "txn_type": "example",
 *   "custom_indexes": [
 *     {
 *       "key": "someKey",
 *       "path": "someJsonPath"
 *     }
 *   ],
 *   "contract_id": false
 * }
 * ```
 */
export interface TransactionTypeResponse {
  version: '1';
  txn_type: string;
  custom_indexes: TransactionTypeCustomIndex[];
  /**
   * If this is a ledger contract type, (not assigned to a contract), then this field will simply be the boolean false,
   * otherwise this will be the string of the associated contract id
   */
  contract_id: string | boolean;
}
