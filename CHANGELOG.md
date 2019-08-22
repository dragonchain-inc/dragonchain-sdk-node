# Changelog

## 3.2.0

- **Feature:**
  - Add deprecation warnings for `createBitcoinTransaction`, `createEthereumTransaction`, and `getPublicBlockchainAddresses`
  - Add support for new interchain management endpoints with client functions:
    - `createBitcoinInterchain`
    - `createEthereumInterchain`
    - `updateBitcoinInterchain`
    - `updateEthereumInterchain`
    - `getInterchainNetwork`
    - `deleteInterchainNetwork`
    - `listInterchainNetworks`
    - `setDefaultInterchainNetwork`
    - `getDefaultInterchainNetwork`
    - `signBitcoinTransaction`
    - `signEthereumTransaction`
- **Development:**
  - Update development dependencies

## 3.1.0

- **Feature:**
  - Use new versioned api endpoints
  - Add support for pending verifications endpoint

## 3.0.9

- **Feature:**
  - Added support for nicknamed api keys
- **Packaging:**
  - Condense TSConfig to a single file
  - Switch build to target ES5 for better backwards-compatibility/legacy support
- **CICD:**
  - Update cicd for new AWS buildspec runtimes
- **Development:**
  - Switch to eslint for linting
  - Add and enforce prettier for formatting
  - Remove outdated integration tests
  - Added code owners which are required for PR review
  - Added issue and PR templates for github
- **Documentation:**
  - Added changelog
