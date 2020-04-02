/**
    Purpose:
    It registers a new DexAG swapping provider.

    How do I execute this script?

    truffle exec ./scripts/registerNewDexAgNetworkSwappingProvider.js --network infuraRopsten
 */
const appConfig = require('../src/config');

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
const NewSwappingProvider = artifacts.require("./providers/DexAgSwappingProvider.sol");
const senderIndex = 0;
const providerName = 'DexAg';
const providerVersion = "1";

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const maxGasForDeploying = appConf.maxGas;
        const dexAgConf = appConf.dexAg;
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;
        const dexAgContracts = dexAgConf.contracts;

        console.log(`Getting StablePayStorage contract address: ${stablepayContracts.StablePayStorage}.`);
        assert(stablepayContracts.StablePayStorage, "StablePayStorage contract address is undefined.");

        const providerStrategy = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        assert(providerStrategy.address, "Provider registry address is undefined.");

        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");

        const sender = accounts[senderIndex];
        assert(sender, "Sender must be defined.");
        console.log(`Address to use as sender: ${sender}.`);

        const providerKeyGenerator = new ProviderKeyGenerator();
        const providerKey = providerKeyGenerator.generateKey(providerName, providerVersion);
        assert(providerKey, 'Provider key object must be defined.');
        assert(providerKey.providerKey, 'Provider key value must be defined.');
        console.log(`New swapping provider key: ${providerKey.providerKey}.`);

        const stablePayAddress = stablepayContracts.StablePay;
        assert(stablePayAddress, 'StablePay address must be defined.');
        const dexAgProxyAddress = dexAgContracts.proxyAddress;
        assert(dexAgProxyAddress, 'Dex AG Proxy address must be defined.');

        const newSwappingProvider = await NewSwappingProvider.new(
            stablePayAddress,
            dexAgProxyAddress,
            { gas: maxGasForDeploying }
        );

        assert(newSwappingProvider, "New swapping provider is undefined.");
        assert(newSwappingProvider.address, "New swapping provider address is undefined.");
        
        /******************************************************************
                                Function Invocation
        ******************************************************************/
        const registerSwappingProviderResult = await providerStrategy.registerSwappingProvider(
            newSwappingProvider.address,
            providerKey.providerKey,
            {from: sender}
        );

        console.log('Transation Result:');
        console.log(util.inspect(registerSwappingProviderResult, {showHidden: false, depth: null}));

        const swappingProviderRegistered = await providerStrategy.getSwappingProvider(providerKey.providerKey);
        assert(swappingProviderRegistered.exists === true, 'Swapping provider must exists.');
        assert(swappingProviderRegistered.pausedByAdmin === true, 'Swapping provider must be paused by admin.');

        console.log(`New Swapping Provider Address: ${swappingProviderRegistered.swappingProvider}`);
        console.log(`Provider Key: ${providerKey.providerKey}`);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }

    /*

    
*/
};
