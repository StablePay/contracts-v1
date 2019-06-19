/**
    Purpose:
    It gets the expected rates for all the swapping providers.

    How do I execute this script?

    truffle exec ./scripts/getExpectedRates.js --network infuraRopsten
 */
// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");

// Util classes
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const sourceTokenName = 'ZIL';
const targetTokenName = 'DAI';
const sourceAmount = "1000000000000"; // 0.005 eth

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const kyberConf = appConf.kyber;
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;
        const tokens = kyberConf.tokens;
        const sourceToken = tokens[sourceTokenName];
        const targetToken = tokens[targetTokenName];

        assert(sourceToken, "Source token is undefined.");
        assert(targetToken, "Target token is undefined.");

        const sourceTokenInstance = await ERC20.at(sourceToken);
        const targetTokenInstance = await ERC20.at(targetToken);

        // const providerStrategy = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        const providerStrategy = await IProviderRegistry.at('0xDA6d869782B45f90074F51F2F3A3f935a9c1D476');
        
        assert(providerStrategy.address, "Provider registry address is undefined.");
        
        const accounts = web3.eth.accounts._provider.addresses;
        assert(accounts, "Accounts must be defined.");

        const getExpectedRatesResult = await providerStrategy.getExpectedRates(
            sourceTokenInstance.address,
            targetTokenInstance.address,
            sourceAmount
        );
        console.log(getExpectedRatesResult);
        assert(getExpectedRatesResult, "Expected rate rante result must exist.");
        /******************************************************************
                                Function Invocation
        ******************************************************************/
        console.log(`Source Token:              ${sourceTokenName}`);
        console.log(`Target Token:              ${targetTokenName}`);
        console.log(`Source Amount:             ${sourceAmount}`);
        getExpectedRatesResult.forEach( expectedRate => {
            //console.log('\n');
            console.log('-'.repeat(50));
            console.log(`Provider Key:              ${expectedRate.providerKey}`);
            console.log(`Is Supported?:             ${expectedRate.isSupported}`);
            console.log(`Min. Rate:                 ${expectedRate.minRate}`);
            console.log(`Max. Rate:                 ${expectedRate.maxRate}`);
        });

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
