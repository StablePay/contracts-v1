/**
    Purpose:
    It registers a new Uniswap swapping provider.

    How do I execute this script?

    truffle exec ./scripts/registerNewUniswapSwappingProvider.js --network infuraRopsten
 */

// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");

// Util classes
const util = require('util');
const assert = require('assert');
const ProviderKeyGenerator = require('../src/utils/ProviderKeyGenerator');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const UniswapSwappingProvider = artifacts.require("./providers/UniswapSwappingProvider.sol");
const senderIndex = 0;
const providerName = 'Uniswap';
const providerVersion = "2";

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const maxGasForDeploying = appConf.maxGas;
        const uniswapConf = appConf.uniswap;
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;
        const uniswapContracts = uniswapConf.contracts;

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

        const stablePayAddress = stablepayContracts.StablePay;
        assert(stablePayAddress, 'StablePay address must be defined.');
        const uniswapFactoryAddress = uniswapContracts.factory;
        assert(uniswapFactoryAddress, 'Uniswap factory address must be defined.');

        const uniswapSwappingProvider = await UniswapSwappingProvider.new(
            stablePayAddress,
            uniswapFactoryAddress,
            {
                from: sender,
                gas: maxGasForDeploying
            }
        );

        assert(uniswapSwappingProvider, "Uniswap swapping provider is undefined.");
        assert(uniswapSwappingProvider.address, "Uniswap swapping provider address is undefined.");
        
        /******************************************************************
                                Function Invocation
        ******************************************************************/
        const registerSwappingProviderResult = await providerStrategy.registerSwappingProvider(
            uniswapSwappingProvider.address,
            providerKey.providerKey,
            {from: sender}
        );

        console.log('Transation Result:');
        console.log(util.inspect(registerSwappingProviderResult, {showHidden: false, depth: null}));

        const newSwappingProvider = await providerStrategy.getSwappingProvider(providerKey.providerKey);
        assert(newSwappingProvider.exists === true, 'Swapping provider must exists.');
        assert(newSwappingProvider.pausedByAdmin === true, 'Swapping provider must be paused by admin.');

        console.log(`New Swapping Provider Address: ${uniswapSwappingProvider.address}`);
        console.log(`Provider Key: ${providerKey.providerKey}`);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
