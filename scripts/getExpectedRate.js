/**
    Purpose:
    It gets the expected rate for a specific swapping provider.

    How do I execute this script?

    truffle exec ./scripts/getExpectedRate.js --network infuraRopsten
 */
// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol");

// Util classes
const BigNumber = require('bignumber.js');
const assert = require('assert');
const ProviderKeyGenerator = require('../src/utils/ProviderKeyGenerator');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const providerName = 'KyberNetwork'; // KyberNetwork or Uniswap
const providerVersion = "1";
const sourceTokenName = 'ETH';
const targetTokenName = 'DAI';
const targetAmount = '10';

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
        assert(targetTokenInstance, "Target token instance is undefined.");

        const tokenDecimals = await targetTokenInstance.decimals();
        assert(tokenDecimals, "Target token decimals is undefined.");
        const decimalsPow = (new BigNumber(10)).pow(tokenDecimals);
        const targetAmountWei = BigNumber(targetAmount).times(decimalsPow).toFixed();
        
        const providerRegistry = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        assert(providerRegistry.address, "Provider registry address is undefined.");
        
        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");
        
        const providerKeyGenerator = new ProviderKeyGenerator();
        const providerKey = providerKeyGenerator.generateKey(providerName, providerVersion);
        assert(providerKey, 'Provider key object must be defined.');
        assert(providerKey.providerKey, 'Provider key value must be defined.');

        const getExpectedRateResult = await providerRegistry.getExpectedRate(
            providerKey.providerKey,
            sourceToken,
            targetTokenInstance.address,
            targetAmountWei
        );
        assert(getExpectedRateResult, "Expected rate rante result must exist.");
        /******************************************************************
                                Function Invocation
        ******************************************************************/
        const {
            minRate,
            maxRate,
        } = getExpectedRateResult;

        console.log(`Provider Name:             ${providerKey.name}`);
        console.log(`Provider Key:              ${providerKey.providerKey}`);
        console.log(`Source Token:              ${sourceTokenName}`);
        console.log(`Target Token:              ${targetTokenName}`);
        console.log(`Target Amount:             ${targetAmount}`);
        console.log(`Is Supported?:             ${getExpectedRateResult.isSupported}`);
        console.log(`Min. Rate:                 ${minRate.toString()}`);
        console.log(`Max. Rate:                 ${maxRate.toString()}`);
        console.log('');
        console.log(`${minRate.toString()}-${maxRate.toString()} ${sourceTokenName} => ${targetAmountWei} ${targetTokenName}`);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
