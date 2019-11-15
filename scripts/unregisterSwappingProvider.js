/**
    Purpose:
    It removes a swapping provider.

    How do I execute this script?

    truffle exec ./scripts/unregisterSwappingProvider.js --network infuraRopsten
 */
// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");

// Util classes
const assert = require('assert');
const ProviderKeyGenerator = require('../src/utils/ProviderKeyGenerator');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const providerName = 'Uniswap'; // KyberNetwork or Uniswap
const providerVersion = "1";

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;

        const providerRegistry = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        assert(providerRegistry.address, "Provider registry address is undefined.");
        
        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");
        
        const providerKeyGenerator = new ProviderKeyGenerator();
        const providerKey = providerKeyGenerator.generateKey(providerName, providerVersion);
        assert(providerKey, 'Provider key object must be defined.');
        assert(providerKey.providerKey, 'Provider key value must be defined.');

        console.log(`Process will unregister swapping provider: ${providerKey.providerKey} / ${providerKey.name}.`);
        
        const getProvidersRegistryCountBeforeResult = await providerRegistry.getProvidersRegistryCount();
        assert(getProvidersRegistryCountBeforeResult, 'Get provider registry count result is undefined.');
        console.log(`Swapping providers available (before): ${getProvidersRegistryCountBeforeResult.toString()}`);

        const unregisterSwappingProviderResult = await providerRegistry.unregisterSwappingProvider(providerKey.providerKey);
        assert(unregisterSwappingProviderResult, "Unregister swapping provider result must exist.");

        const getProvidersRegistryCountAfterResult = await providerRegistry.getProvidersRegistryCount();
        assert(getProvidersRegistryCountAfterResult, 'Get provider registry count result is undefined.');
        console.log(`Swapping providers available (after): ${getProvidersRegistryCountAfterResult.toString()}`);

        const swappingProviderAfter = await providerRegistry.getSwappingProvider(providerKey.providerKey);
        console.log(swappingProviderAfter);
        assert(swappingProviderAfter.exists === false, 'Swapping provider must not exist.');
        /******************************************************************
                                Function Invocation
        ******************************************************************/

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
