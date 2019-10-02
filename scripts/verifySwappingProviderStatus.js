/**
    Purpose:
    It verifies the swapping provider information.

    How do I execute this script?

    truffle exec ./scripts/verifySwappingProviderStatus.js --network infuraRopsten
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
const providerName = 'KyberNetwork';
const providerVersion = "1";

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;

        const providerStrategy = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        assert(providerStrategy.address, "Provider registry address is undefined.");

        const accounts = web3.eth.accounts._provider.addresses;
        assert(accounts, "Accounts must be defined.");

        const providerKeyGenerator = new ProviderKeyGenerator();
        const providerKey = providerKeyGenerator.generateKey(providerName, providerVersion);
        assert(providerKey, 'Provider key object must be defined.');
        assert(providerKey.providerKey, 'Provider key value must be defined.');

        /******************************************************************
                                Function Invocation
        ******************************************************************/
        const newSwappingProvider = await providerStrategy.getSwappingProvider(providerKey.providerKey);
        console.log(`Name:              ${providerName}`);
        console.log(`Version:           ${providerVersion}`);
        console.log(`Key:               ${providerKey.providerKey}`);
        console.log(`Exists:            ${newSwappingProvider.exists}`);
        console.log(`Address:           ${newSwappingProvider.providerAddress}`);
        console.log(`Owner:             ${newSwappingProvider.ownerAddress}`);
        console.log(`Paused by Admin:   ${newSwappingProvider.pausedByAdmin}`);
        const createdAt = newSwappingProvider.createdAt * 1000;
        console.log(`Created At:        ${createdAt}`);
        console.log(`Created At:        ${new Date(createdAt)}`);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
