/**
    Purpose:
    It pauses a specific swapping provider using the name defined in the stablepay.js configuration.

    How do I execute this script?

    truffle exec ./scripts/pauseByOwnerSwappingProvider.js --network infuraRopsten
 */

// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");

// Util classes
const util = require('util');
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const ProviderKeyGenerator = require('../src/utils/ProviderKeyGenerator');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const senderIndex = 0;
const providerName = 'KyberNetwork'; // Options: 'Uniswap' or 'KyberNetwork'
const providerVersion = '1';

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;
        const stablepayProviders = stablepayConf.providers;

        const providerStrategy = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        assert(providerStrategy.address, "Provider registry address is undefined.");

        const accounts = web3.eth.accounts._provider.addresses;
        assert(accounts, "Accounts must be defined.");

        const sender = accounts[senderIndex];
        assert(sender, "Sender must be defined.");

        const providerKeyGenerator = new ProviderKeyGenerator();
        const providerKey = providerKeyGenerator.generateKey(providerName, providerVersion);
        assert(providerKey, 'Provider key object must be defined.');
        assert(providerKey.providerKey, 'Provider key value must be defined.');
        
        const swappingProviderBefore = await providerStrategy.getSwappingProvider(providerKey.providerKey);
        assert(swappingProviderBefore.exists === true, 'Swapping provider must exist.');
        assert(swappingProviderBefore.pausedByOwner === false, 'Swapping provider must not be paused by owner.');
        assert(swappingProviderBefore.pausedByAdmin === false, 'Swapping provider must not be paused by admin.');

        /******************************************************************
                                Function Invocation
        ******************************************************************/
        const pauseSwappingProviderResult = await providerStrategy.pauseSwappingProvider(providerKey.providerKey, { from: sender });

        console.log('Transation Result:');
        console.log(util.inspect(pauseSwappingProviderResult, {showHidden: false, depth: null}));

        const swappingProviderAfter = await providerStrategy.getSwappingProvider(providerKey.providerKey);
        assert(swappingProviderAfter.pausedByOwner === true, 'Swapping provider must be paused by owner.');

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
