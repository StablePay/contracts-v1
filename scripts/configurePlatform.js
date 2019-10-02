/**
    Purpose:
    It configures:

    - Default Post Action
    - Unpause current swapping providers.

    How do I execute this script?

    truffle exec ./scripts/configureStablePayPlatform.js --network infuraRopsten
 */

// Smart contracts
const IPostActionRegistry = artifacts.require("./interface/IPostActionRegistry.sol");
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");

// Util classes
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const senderIndex = 0;
const providerNames = ['Kyber', 'Uniswap'];
const postActionContractName = 'TransferToPostAction';

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

        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");

        const sender = accounts[senderIndex];
        assert(sender, "Sender must be defined.");

        for (const providerName of providerNames) {
            const providerKey = stablepayProviders[providerName];
            assert(providerKey, 'Provider key must be defined.');
            
            const swappingProviderBefore = await providerStrategy.getSwappingProvider(providerKey);
            assert(swappingProviderBefore);
            assert(swappingProviderBefore.exists === true, 'Swapping provider must exist.');
            assert(swappingProviderBefore.pausedByAdmin === true, 'Swapping provider must be paused by admin.');

            const unpauseSwappingProviderResult = await providerStrategy.unpauseByAdminSwappingProvider(providerKey, { from: sender });
            assert(unpauseSwappingProviderResult);

            const swappingProviderAfter = await providerStrategy.getSwappingProvider(providerKey);
            assert(swappingProviderAfter.pausedByAdmin === false, 'Swapping provider must not be paused by admin.');

            console.log(`Provider ${providerName} is unpaused.`);
        }

        const postActionAddress = stablepayContracts[postActionContractName];
        assert(postActionAddress, 'Post action address is undefined');
        
        const postActionRegistry = await IPostActionRegistry.at(stablepayContracts.PostActionRegistry);
        assert(postActionRegistry.address, "Post action registry address is undefined.");

        const setPostActionAsDefaultResult = await postActionRegistry.setPostActionAsDefault(postActionAddress);
        assert(setPostActionAsDefaultResult, 'Set post action as default is undefined.');
        console.log(`New default post action: ${postActionAddress}.`);
        
        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
