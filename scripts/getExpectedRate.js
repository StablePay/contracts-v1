/**
    Purpose:
    It gets the expected rate for a specific swapping provider.

    How do I execute this script?

    truffle exec ./scripts/getExpectedRate.js --network infuraRopsten
 */
// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");

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
const sourceTokenName = 'ZIL';
const targetTokenName = 'DAI';
const sourceAmount = "100000000"; // 0.005 eth

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
        
        const providerKeyGenerator = new ProviderKeyGenerator();
        const providerKey = providerKeyGenerator.generateKey(providerName, providerVersion);
        assert(providerKey, 'Provider key object must be defined.');
        assert(providerKey.providerKey, 'Provider key value must be defined.');

        const getExpectedRateResult = await providerStrategy.getExpectedRate(
            providerKey.providerKey,
            sourceTokenInstance.address,
            targetTokenInstance.address,
            sourceAmount
        );
        assert(getExpectedRateResult, "Expected rate rante result must exist.");
        /******************************************************************
                                Function Invocation
        ******************************************************************/
        console.log(`Provider Name:             ${providerKey.name}`);
        console.log(`Provider Key:              ${providerKey.providerKey}`);
        console.log(`Source Token:              ${sourceTokenName}`);
        console.log(`Target Token:              ${targetTokenName}`);
        console.log(`Source Amount:             ${sourceAmount}`);
        console.log(`Is Supported?:             ${getExpectedRateResult.isSupported}`);
        console.log(`Min. Rate:                 ${getExpectedRateResult.minRate}`);
        console.log(`Max. Rate:                 ${getExpectedRateResult.maxRate}`);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
