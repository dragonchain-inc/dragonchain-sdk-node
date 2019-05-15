# Dragonchain JS SDK 
[![Build Status](https://travis-ci.org/dragonchain-inc/dragonchain-sdk-node.svg?branch=master)](https://travis-ci.org/dragonchain-inc/dragonchain-sdk-node)

Talk to your dragonchain.
## Tutorial / Examples:
A tutorial on creating a custom contract can be found here https://github.com/dragonchain-inc/custom-contract-node-sdk. Also worth looking at the integration tests file for a number of examples. https://github.com/dragonchain-inc/dragonchain-sdk-node/blob/master/spec/integration.ts
## Method Quicklinks

These docs are auto-generated.

* [constructor](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#constructor)
* [clearOverriddenCredentials](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#clearOverriddenCredentials)
* [createContract](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#createContract)
* [createLibraryContract](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#createlibrarycontract)
* [createTransaction](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#createtransaction)
* [createBulkTransaction](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#createbulktransaction)
* [getBlock](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#getblock)
* [getSmartContract](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#getsmartcontract)
* [getSmartContractHeap](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#getsmartcontractheap)
* [listSmartcontractHeap](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#listsmartcontractheap)
* [getStatus](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#getstatus)
* [getTransaction](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#getTransaction)
* [overrideCredentials](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#overridecredentials)
* [setDragonchainId](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#setdragonchainId)
* [getVerifications](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#getverifications)
* [setLogLevel](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#setloglevel)
* [queryTransactions](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#querytransactions)
* [queryBlocks](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#queryblocks)
* [querySmartContracts](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#querysmartcontracts)
* [updateSmartContract](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#updatesmartcontract)
* [updateLibrarySmartContract](https://node-sdk-docs.dragonchain.com/latest/classes/dragonchainclient.html#updatelibrarysmartcontract)

### Versions

* [latest](https://node-sdk-docs.dragonchain.com/latest)

### Installation

```sh
npm i dragonchain-sdk --save
```

### Examples

#### GetBlock

```javascript
const Dragonchain = require('dragonchain-sdk');

const myDcId = '3f2fef78-0000-0000-0000-9f2971607130';
const client = new Dragonchain.DragonchainClient(myDcId);

const call = await client.getBlock('block-id-here');

if (call.ok) {
  console.log('Successful call!');
  console.log(`Block: ${call.response}`);
} else {
  console.error('Something went wrong!');
  console.error(`HTTP status code from chain: ${call.status}`);
  console.error(`Error response from chain: ${call.response}`);
}
```

#### QueryTransactions

```javascript
const searchResult = await client.queryTransactions('tag=MyAwesomeTransactionTag')
```

#### OverrideCredentials

This is fine for quick tests. For actual production use, you should use the [credential ini file or environment variables](#configuration)

```javascript
dragonchain.overrideCredentials('AUTH_KEY_ID','AUTH_KEY')
```

## Configuration

In order to use this SDK, you need to have an Auth Key as well as an Auth Key ID for a given dragonchain.
This can be loaded into the sdk in various ways, and are checked in the following order of precedence:

1. The environment variables `AUTH_KEY` and `AUTH_KEY_ID` can be set with the appropriate values
2. Write an ini-style credentials file at `~/.dragonchain/credentials` (or on Windows: `%LOCALAPPDATA%\dragonchain\credentials`) where the section name is the dragonchain id, with values for `auth_key` and `auth_key_id` like so:

```ini
[35a7371c-a20a-4830-9a59-5d654fcd0a4a]
auth_key_id = JSDMWFUJDVTC
auth_key = n3hlldsFxFdP2De0yMu6A4MFRh1HGzFvn6rJ0ICZzkE
```

## Logging

In order to get the logging output of the sdk, a logger must be set (by default all logging is thrown away).

In order to set the logger, simply call `.setLogger` on the root of the require/import. For example, if you just wanted to log with `console` (i.e. stdout, stderr, etc), you can set the logger like the following:

```javascript
const SDK = require('dragonchain-sdk');
SDK.setLogger(console);
```

In that example, `console` can be replaced with any custom logger as long as it implements `log`, `info`, `warn`, `debug`, and `error` functions.

To reset the logger back to default (so it doesn't output anymore), simply called `setLogger()` with no params.

## Contributing

Dragonchain is happy to welcome contributions from the community. You can get started [here](https://github.com/dragonchain-inc/dragonchain-sdk-node/blob/master/CONTRIBUTING.md).
