"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_1 = require("fs");
const util_1 = require("util");
const os_1 = require("os");
const path = require("path");
const ini = require("ini");
const node_fetch_1 = require("node-fetch");
const FailureByDesign_1 = require("../../errors/FailureByDesign");
const index_1 = require("../../index");
/**
 * @hidden
 */
let readFileAsync = () => tslib_1.__awaiter(this, void 0, void 0, function* () { return ''; });
if (fs_1.readFile)
    readFileAsync = util_1.promisify(fs_1.readFile);
/**
 * @hidden
 * Get the path for the configuration file depending on the OS
 * @returns {string} dragonchain configuration file path
 * @example e.g.: "~/.dragonchain/credentials" or "%LOCALAPPDATA%\dragonchain\credentials" on Windows
 */
const getConfigFilePath = (injected = { platform: os_1.platform, homedir: os_1.homedir }) => {
    if (injected.platform() === 'win32') {
        return path.join(process.env.LOCALAPPDATA || '', 'dragonchain', 'credentials');
    }
    return path.join(injected.homedir(), '.dragonchain', 'credentials');
};
exports.getConfigFilePath = getConfigFilePath;
/**
 * @hidden
 * Get the endpoint for a dragonchain from environment variables
 * @returns {string} Dragonchain enpdoint if found, empty string if not
 */
const getIdFromEnvVars = () => {
    return process.env.DRAGONCHAIN_ID || '';
};
exports.getIdFromEnvVars = getIdFromEnvVars;
/**
 * @hidden
 * get the endpoint for a dragonchain from environment variables
 * @returns {string} Dragonchain enpdoint if found, empty string if not
 */
const getEndpointFromEnvVars = () => {
    return process.env.DRAGONCHAIN_ENDPOINT || '';
};
exports.getEndpointFromEnvVars = getEndpointFromEnvVars;
/**
 * @hidden
 * get the credentials for a dragonchain from environment variables
 * @returns {DragonchainCredentials} Dragonchain enpdoint if found, false if not
 */
const getCredsFromEnvVars = () => {
    const authKey = process.env.AUTH_KEY;
    const authKeyId = process.env.AUTH_KEY_ID;
    if (!authKey || !authKeyId)
        return false;
    return { authKey, authKeyId };
};
exports.getCredsFromEnvVars = getCredsFromEnvVars;
/**
 * @hidden
 * get the default dragonchain ID from the configuration file
 * @returns {Promise<string>} dragonchain ID if found in file, empty string if not
 */
const getIdFromFile = (injected = { readFileAsync }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let config = {};
    try {
        config = ini.parse(yield injected.readFileAsync(getConfigFilePath(), 'utf-8'));
    }
    catch (e) {
        index_1.logger.debug(`Error loading ID from config file ${e}`);
        return '';
    }
    return config.default && config.default.dragonchain_id ? config.default.dragonchain_id : '';
});
exports.getIdFromFile = getIdFromFile;
/**
 * @hidden
 * get the dragonchain endpoint from the configuration file
 * @returns {Promise<string>} dragonchain endpoint if found in file, empty string if not
 */
const getEndpointFromFile = (dragonchainId, injected = { readFileAsync }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let config = {};
    try {
        config = ini.parse(yield injected.readFileAsync(getConfigFilePath(), 'utf-8'));
    }
    catch (e) {
        index_1.logger.debug(`Error loading from config file ${e}`);
        return '';
    }
    return config[dragonchainId] && config[dragonchainId].endpoint ? config[dragonchainId].endpoint : '';
});
exports.getEndpointFromFile = getEndpointFromFile;
/**
 * @hidden
 * get the dragonchain credentials from the configuration file
 * @returns {Promise<DragonchainCredentials>} dragonchain credentials if found in file, false if not
 */
const getCredsFromFile = (dragonchainId, injected = { readFileAsync }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let config = {};
    try {
        config = ini.parse(yield injected.readFileAsync(getConfigFilePath(), 'utf-8'));
    }
    catch (e) {
        index_1.logger.debug(`Error loading credentials from config file ${e}`);
        return false;
    }
    if (!config[dragonchainId])
        return false;
    const { auth_key, auth_key_id } = config[dragonchainId];
    if (!auth_key || !auth_key_id)
        return false;
    return {
        authKey: auth_key,
        authKeyId: auth_key_id
    };
});
exports.getCredsFromFile = getCredsFromFile;
/**
 * @hidden
 * use a remote service to fetch the endpoint of a dragonchain by id
 * @param {string} dragonchainId dragonchainId to request endpoint for
 * @returns {Promise<string>} the endpoint of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>} if unable to contact remote service or not found
 */
const getEndpointFromRemote = (dragonchainId, injected = { fetch: node_fetch_1.default }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    try {
        const result = yield injected.fetch(`https://matchmaking.api.dragonchain.com/registration/${dragonchainId}`, { timeout: 30000 });
        const json = result.json();
        const endpoint = json.url;
        if (!endpoint)
            throw new Error(`Bad response from remote service ${json}`); // Caught and re-thrown below
        return endpoint;
    }
    catch (e) {
        throw new FailureByDesign_1.FailureByDesign('NOT_FOUND', `Failure to retrieve dragonchain endpoint from remote service ${e}`);
    }
});
exports.getEndpointFromRemote = getEndpointFromRemote;
/**
 * @hidden
 * get credentials for a dragonchain from the standard location for a smart contract
 * @returns {Promise<DragonchainCredentials>} dragonchain credentials if found, false if not
 */
const getCredsAsSmartContract = (injected = { readFileAsync }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let authKeyId = '';
    let authKey = '';
    const basePath = path.join('/', 'var', 'openfaas', 'secrets');
    try {
        authKeyId = yield injected.readFileAsync(path.join(basePath, `sc-${process.env.SMART_CONTRACT_ID}-auth-key-id`), 'utf-8');
        authKey = yield injected.readFileAsync(path.join(basePath, `sc-${process.env.SMART_CONTRACT_ID}-secret-key`), 'utf-8');
    }
    catch (e) {
        index_1.logger.debug(`Error loading credentials from SC location ${e}`);
        return false;
    }
    if (!authKeyId || !authKey)
        return false;
    return { authKey, authKeyId };
});
exports.getCredsAsSmartContract = getCredsAsSmartContract;
/**
 * Get the default configured dragonchainId from environment/config file
 * @returns {Promise<string>}
 * @throws {FailureByDesign<NOT_FOUND>}
 */
const getDragonchainId = (injected = { getIdFromEnvVars, getIdFromFile }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    index_1.logger.debug('Checking if dragonchain_id is in the environment');
    let dragonchainId = injected.getIdFromEnvVars();
    if (dragonchainId)
        return dragonchainId;
    index_1.logger.debug('Dragonchain ID not provided in environment, will search on disk');
    dragonchainId = yield injected.getIdFromFile();
    if (dragonchainId)
        return dragonchainId;
    throw new FailureByDesign_1.FailureByDesign('NOT_FOUND', 'Configuration file is missing a default id');
});
exports.getDragonchainId = getDragonchainId;
/**
 * @hidden
 * Get the endpoint for a dragonchain. First checks environment, then configuration files, then a remote service
 * @param {string} dragonchainId dragonchainId to get endpoint for
 * @returns {Promise<string>} Endpoint of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>}
 */
const getDragonchainEndpoint = (dragonchainId, injected = { getEndpointFromEnvVars, getEndpointFromFile, getEndpointFromRemote }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let endpoint = injected.getEndpointFromEnvVars();
    if (endpoint)
        return endpoint;
    index_1.logger.debug('Endpoint isn\'t in environment, trying to load from ini config file');
    endpoint = yield injected.getEndpointFromFile(dragonchainId);
    if (endpoint)
        return endpoint;
    index_1.logger.debug('Endpoint isn\'t in config file, trying to load from remote service');
    return injected.getEndpointFromRemote(dragonchainId); // This will throw NOT_FOUND if necessary
});
exports.getDragonchainEndpoint = getDragonchainEndpoint;
/**
 * Get the credentials for a dragonchain. First checks environment, then configuration files, then a smart contract location
 * @param {string} dragonchainId dragonchainId to get credentials for
 * @returns {DragonchainCredentials} Credentials of the dragonchain
 * @throws {FailureByDesign<NOT_FOUND>}
 */
const getDragonchainCredentials = (dragonchainId, injected = { getCredsFromEnvVars, getCredsFromFile, getCredsAsSmartContract }) => tslib_1.__awaiter(this, void 0, void 0, function* () {
    let credentials = injected.getCredsFromEnvVars();
    if (credentials)
        return credentials;
    index_1.logger.debug('Credentials aren\'t in environment, trying to load from ini config file');
    credentials = yield injected.getCredsFromFile(dragonchainId);
    if (credentials)
        return credentials;
    index_1.logger.debug('Credentials aren\'t in config file, trying to load as a smart contract');
    credentials = yield injected.getCredsAsSmartContract();
    if (credentials)
        return credentials;
    throw new FailureByDesign_1.FailureByDesign('NOT_FOUND', `Credentials for ${dragonchainId} could not be found`);
});
exports.getDragonchainCredentials = getDragonchainCredentials;
/**
 * All Humans are welcome.
 */
