# Dragonchain JS SDK

[![Latest npm version](https://img.shields.io/npm/v/dragonchain-sdk)](https://www.npmjs.com/package/dragonchain-sdk)
[![Build Status](https://travis-ci.org/dragonchain-inc/dragonchain-sdk-node.svg?branch=master)](https://travis-ci.org/dragonchain-inc/dragonchain-sdk-node)
[![Node Version Support](https://img.shields.io/node/v/dragonchain-sdk)](https://github.com/dragonchain-inc/dragonchain-sdk-node)
[![Code Style: Prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg)](https://prettier.io/)
[![License](https://img.shields.io/badge/license-Apache%202.0-informational.svg)](https://github.com/dragonchain-inc/dragonchain-sdk-node/blob/master/LICENSE)
![Banana Index](https://img.shields.io/endpoint.svg?url=https%3A%2F%2Fnode-sdk-docs.dragonchain.com%2Fbanana-shield.json)

Talk to your dragonchain.

## Docs

* [latest](https://node-sdk-docs.dragonchain.com/latest)

### Installation

```sh
npm i dragonchain-sdk --save
```

## Tutorial / Examples

A tutorial on creating a custom contract can be [found here](https://github.com/dragonchain-inc/custom-contract-node-sdk).

### Initialize The Client

```javascript
const sdk = require('dragonchain-sdk');

const main = async () => {
  const client = await sdk.createClient({
    dragonchainId: 'c2dffKwiGj6AGg4zHkNswgEcyHeQaGr4Cm5SzsFVceVv'
  });
  // Do something with the client here
}

main().then(console.log).catch(console.error);
```

### GetBlock

```javascript
const call = await client.getBlock({ blockId: '56841' });

if (call.ok) {
  console.log('Successful call!');
  console.log(`Block: ${call.response}`);
} else {
  console.error('Something went wrong!');
  console.error(`HTTP status code from chain: ${call.status}`);
  console.error(`Error response from chain: ${call.response}`);
}
```

### QueryTransactions

```javascript
const searchResult = await client.queryTransactions({ luceneQuery: 'tag=MyAwesomeTransactionTag' })

if (call.ok) {
  console.log('Successful call!');
  console.log(`Query Result: ${searchResult.response}`);
} else {
  console.error('Something went wrong!');
  console.error(`HTTP status code from chain: ${searchResult.status}`);
  console.error(`Error response from chain: ${searchResult.response}`);
}
```

## Configuration

In order to use this SDK, you need to have an Auth Key as well as
an Auth Key ID for a given Dragonchain ID. It is also strongly suggested that
you supply an endpoint locally so that a remote service isn't called to
automatically discover your dragonchain endpoint. These can be loaded into the
sdk in various ways, and are checked in the following order of precedence:

1. The `createClient` method can be initialized with an object containing
   the parameters `dragonchainId: <ID>`, `authKey: <KEY>`,
   `authKeyId: <KEY_ID>`, and `endpoint: <URL>`

2. The environment variables `DRAGONCHAIN_ID`,
   `AUTH_KEY`, `AUTH_KEY_ID`, and `DRAGONCHAIN_ENDPOINT`,
   can be set with the appropriate values

3. An ini-style credentials file can be provided at
   `~/.dragonchain/credentials` (or on Windows:
   `%LOCALAPPDATA%\dragonchain\credentials`) where the section name is the
   dragonchain id, with values for `auth_key`, `auth_key_id`, and `endpoint`.
   Additionally, you can supply a value for `dragonchain_id` in the
   `default` section to initialize the client for a specific chain
   without supplying an ID any other way

```ini
[default]
dragonchain_id = c2dffKwiGj6AGg4zHkNswgEcyHeQaGr4Cm5SzsFVceVv

[c2dffKwiGj6AGg4zHkNswgEcyHeQaGr4Cm5SzsFVceVv]
auth_key_id = JSDMWFUJDVTC
auth_key = n3hlldsFxFdP2De0yMu6A4MFRh1HGzFvn6rJ0ICZzkE
endpoint = https://35a7371c-a20a-4830-9a59-5d654fcd0a4a.api.dragonchain.com

[28VhSgtPhwkhKBgmQSW6vrsir7quEYHdCjqsW6aAYbfrw]
auth_key_id = OGNHGLYIFVUA
auth_key = aS73Si7agvX9gfxnLMh6ack9DEuidKiwQxkqBudXl81
endpoint = https://28567017-6412-44b6-80b2-12876fb3d4f5.api.dragonchain.com
```

## Logging

In order to get the logging output of the sdk, a logger must be set (by default all logging is ignored).

In order to set the logger, simply call `.setLogger` on the root of the require/import. For example, if you just wanted to log with `console` (i.e. stdout, stderr, etc), you can set the logger like the following:

```javascript
const sdk = require('dragonchain-sdk');
sdk.setLogger(console);
```

In that example, `console` can be replaced with any custom logger as long as it implements `log`, `info`, `warn`, `debug`, and `error` functions.

To reset the logger back to default (so it doesn't output anymore), simply called `setLogger()` with no params.

## Contributing

Dragonchain is happy to welcome contributions from the community. You can get started [here](https://github.com/dragonchain-inc/dragonchain-sdk-node/blob/master/CONTRIBUTING.md).
