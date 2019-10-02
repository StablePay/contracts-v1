/**
    Purpose:
    It get the expected rate range for the platform.

    How do I execute this script?

    truffle exec ./scripts/getExpectedRateRange.js --network infuraRopsten
 */
// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol");

// Util classes
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const sourceTokenName = 'SNT';
const targetTokenName = 'DAI';
const sourceAmount = "1000000000000";

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

        const providerStrategy = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        assert(providerStrategy.address, "Provider registry address is undefined.");
        
        const accounts = web3.eth.accounts._provider.addresses;
        assert(accounts, "Accounts must be defined.");

        const getExpectedRateRangeResult = await providerStrategy.getExpectedRateRange(
            sourceTokenInstance.address,
            targetTokenInstance.address,
            sourceAmount
        );
        assert(getExpectedRateRangeResult, "Expected rate rante result must exist.");
        /******************************************************************
                                Function Invocation
        ******************************************************************/
        console.log(`Source Token:              ${sourceTokenName}`);
        console.log(`Target Token:              ${targetTokenName}`);
        console.log(`Source Amount:             ${sourceAmount}`);
        console.log(`Min. Rate:                 ${getExpectedRateRangeResult.minRate}`);
        console.log(`Max. Rate:                 ${getExpectedRateRangeResult.maxRate}`);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
