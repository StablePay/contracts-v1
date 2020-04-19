/* eslint-disable no-console */
/* eslint-disable global-require */
/**
    Purpose:
    It unpauses a specific swapping provider using the name defined in the stablepay.js configuration.

    How do I execute this script?

    truffle exec ./scripts/unpauseByAdminSwappingProvider.js --network infuraRopsten
 */

// Smart contracts
// eslint-disable-next-line no-undef
const IProviderRegistry = artifacts.require('./interface/IProviderRegistry.sol');

// Util classes
const util = require('util');
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');

const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const senderIndex = 0;
const providerName = 'DexAg'; // Options: 'Uniswap' | 'Kyber' | 'DexAg'

module.exports = async (callback) => {
  try {
    const network = processArgs.network();
    console.log(`Script will be executed in network ${network}.`);
    const appConf = require('../config')(network);
    const stablepayConf = appConf.stablepay;
    const stablepayContracts = stablepayConf.contracts;
    const stablepayProviders = stablepayConf.providers;

    const providerStrategy = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
    assert(providerStrategy.address, 'Provider registry address is undefined.');

    const accounts = await web3.eth.getAccounts();
    assert(accounts, 'Accounts must be defined.');

    const sender = accounts[senderIndex];
    assert(sender, 'Sender must be defined.');

    const providerKey = stablepayProviders[providerName];
    assert(providerKey, 'Provider key must be defined.');

    const swappingProviderBefore = await providerStrategy.getSwappingProvider(providerKey);
    console.log(swappingProviderBefore);
    assert(swappingProviderBefore.exists === true, 'Swapping provider must exist.');
    assert(swappingProviderBefore.pausedByAdmin === true, 'Swapping provider must be paused by admin.');

    /** ****************************************************************
                                Function Invocation
        ***************************************************************** */
    const unpauseSwappingProviderResult = await providerStrategy.unpauseByAdminSwappingProvider(providerKey, { from: sender });

    console.log('Transation Result:');
    console.log(util.inspect(unpauseSwappingProviderResult, { showHidden: false, depth: null }));

    const swappingProviderAfter = await providerStrategy.getSwappingProvider(providerKey);
    assert(swappingProviderAfter.pausedByAdmin === false, 'Swapping provider must not be paused by admin.');

    console.log('>>>> The script finished successfully. <<<<');
    callback();
  } catch (error) {
    console.log(error);
    callback(error);
  }
};
