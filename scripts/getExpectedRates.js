/**
    Purpose:
    It gets the expected rates for all the swapping providers.

    How do I execute this script?

    truffle exec ./scripts/getExpectedRates.js --network infuraRopsten
 */
// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol");

// Util classes
const BigNumber = require('bignumber.js');
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const sourceTokenName = 'ETH';
const targetTokenName = 'DAI';
const targetAmount = "10";

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

        const targetTokenInstance = await ERC20.at(targetToken);

        const tokenDecimals = await targetTokenInstance.decimals();
        const decimalsPow = (new BigNumber(10)).pow(tokenDecimals);
        const targetAmountWei = BigNumber(targetAmount).times(decimalsPow).toFixed();

        const providerStrategy = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        
        assert(providerStrategy.address, "Provider registry address is undefined.");
        
        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");

        const getProvidersRegistryCountResult = await providerStrategy.getProvidersRegistryCount();
        assert(getProvidersRegistryCountResult, 'Get provider registry count result is undefined.');
        console.log(`Swapping providers registered: ${getProvidersRegistryCountResult.toString()}`);

        const getExpectedRatesResult = await providerStrategy.getExpectedRates(
            sourceToken,
            targetTokenInstance.address,
            targetAmountWei
        );
        assert(getExpectedRatesResult, "Expected rate rante result must exist.");
        /******************************************************************
                                Function Invocation
        ******************************************************************/
        console.log(`Source Token:              ${sourceTokenName}`);
        console.log(`Target Token:              ${targetTokenName}`);
        console.log(`Target Amount:             ${targetAmount} / ${targetAmountWei}`);
        if(getExpectedRatesResult.length === 0) {
            console.log(`Not available providers found.`);
        }
        getExpectedRatesResult.forEach( expectedRate => {
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
