# Dragonchain JS SDK
![code-build status](https://codebuild.us-west-2.amazonaws.com/badges?uuid=eyJlbmNyeXB0ZWREYXRhIjoiUFpHWHVOTHpQSHo4T3ZHSjBUT3JZQ0kzRHBybUFvbCt4WjB6MHFhY2F1dmxPTU1mUUZUYXk4d0QzTXpUMzhRek9sZ2dLclkwcTVjTEpJaElUN3cxQUdjPSIsIml2UGFyYW1ldGVyU3BlYyI6Ik56K0RLUFUxVnhpUHNCNWoiLCJtYXRlcmlhbFNldFNlcmlhbCI6MX0%3D&branch=master)

Talk to your dragonchain.

# Latest Official JS Docs
These docs are auto-generated.

* [constructor](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#constructor)
* [clearOverriddenCredentials](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#clearOverriddenCredentials)
* [createCustomContract](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#createcustomcontract)
* [createTransaction](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#createtransaction)
* [getBlock](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#getblock)
* [getSmartcontract](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#getsmartcontract)
* [getStatus](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#getstatus)
* [getTransaction](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#getTransaction)
* [overrideCredentials](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#overridecredentials)
* [queryTransactions](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#querytransactions)
* [setDragonchainId](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#setdragonchainId)
* [getBlock](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#getblock)
* [getVerifications](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#getverifications)
* [getTransaction](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#gettransaction)
* [createContract](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#createcontract)
* [listContracts](https://node-sdk-docs.dragonchain.com/classes/dragonchainclient.html#listcontracts)

### Installation
```bash
npm i dragonchain-sdk --save
```

### Examples
#### GetBlock
```javascript
const myDcId = '3f2fef78-0000-0000-0000-9f2971607130';
const dragonchain = new DragonchainClient(myDcId);
try {
  const blockAtRest = dragonchain.getBlock('block-id-here');
  // ... do stuff ...
} catch(e) {
  if (e.code === 'NOT_FOUND') {
    console.log('Oops! That Block does not exist!')
  }
}
```

#### QueryTransactions
```javascript
const searchResult = await dragonchain.queryTransactions('tag:"MyAwesomeTransactionTag"')
```

#### OverrideCredentials
This is fine for quick tests. For actual production use, you should use the [credential ini file](#configuration)
```javascript
dragonchain.overrideCredentials('AUTH_KEY_ID','AUTH_KEY')
dragonchain.clearOverriddenCredentials() // unset credentials
```
## Configuration

In order to use this SDK, you need to have an Auth Key as well as an Auth Key ID for a given dragonchain.
This can be loaded into the sdk in various ways, and are checked in the following order of precedence:

1. The environment variables `AUTH_KEY` and `AUTH_KEY_ID` can be set with the appropriate values
1. Write an ini-style credentials file at `~/.dragonchain/credentials` (or on Windows: `%LOCALAPPDATA%\dragonchain\credentials`) where the section name is the dragonchain id, with values for `auth_key` and `auth_key_id` like so:

```ini
[35a7371c-a20a-4830-9a59-5d654fcd0a4a]
auth_key_id = JSDMWFUJDVTC
auth_key = n3hlldsFxFdP2De0yMu6A4MFRh1HGzFvn6rJ0ICZzkE
```
