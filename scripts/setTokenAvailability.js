/**
    Purpose:
    It sets the availability amount of target tokens in the platform.

    How do I execute this script?

    truffle exec ./scripts/setTokenAvailability.js --network infuraRopsten
 */

// Smart contracts
const ISettings = artifacts.require("./interface/ISettings.sol");
const ERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol");

// Util classes
const assert = require('assert');
const Amount = require('../src/amounts/Amount');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

const logTokenAvailability = (title, tokenName, tokenAddress, result) => {
    console.log('\n');
    console.log(`>>>> ${title}`)
    console.log(`Token Address:     ${tokenAddress} (${tokenName})`);
    console.log(`Token Available:   ${result.available}`);
    console.log(`Min Amount:        ${result.minAmount}`);
    console.log(`Max Amount:        ${result.maxAmount}`);
}

/**
    Script Arguments
 */
const senderIndex = 0;
const settingsContractName = 'Settings';
const tokenName = 'DAI';
const minAmount = '1';
const maxAmount = '10';

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const stablepayConf = appConf.stablepay;
        const kyberConf = appConf.kyber;
        const stablepayContracts = stablepayConf.contracts;
        const tokens = kyberConf.tokens;
        
        assert(tokenName, 'Token name is undefined');
        const tokenAddress = tokens[tokenName];
        assert(tokenAddress, 'Token address is undefined');
        
        const token = await ERC20.at(tokenAddress);
        assert(token, "Token is undefined");
        assert(token.address, "Token address is undefined");

        const settingsAddress = stablepayContracts[settingsContractName];
        assert(settingsAddress, 'Settings address is undefined');
        
        const settingsInstance = await ISettings.at(settingsAddress);
        assert(settingsInstance, "Settings address is undefined.");
        assert(settingsInstance.address, "Settings address instance is undefined.");

        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");

        const sender = accounts[senderIndex];
        assert(sender, "Sender must be defined.");

        const getTokenAvailabilityResult = await settingsInstance.getTokenAvailability(tokenAddress);
        assert(getTokenAvailabilityResult, "Get token Availability result is undefined.");

        logTokenAvailability('Initial Token Availability', tokenName, tokenAddress, getTokenAvailabilityResult);

        const tokenDecimals = await token.decimals();
        const minAmountAmount = new Amount(minAmount, tokenDecimals.toString());
        const maxAmountAmount = new Amount(maxAmount, tokenDecimals.toString());

        const setTokenAvailabilityResult = await settingsInstance.setTokenAvailability(
            tokenAddress,
            minAmountAmount.asWeisFixed(),
            maxAmountAmount.asWeisFixed(),
            {from: sender}
        );
        assert(setTokenAvailabilityResult, "Set token availability result is undefined.");

        const getTokenAvailabilityFinalResult = await settingsInstance.getTokenAvailability(tokenAddress);
        assert(getTokenAvailabilityFinalResult, "Get token Availability final result is undefined.");
        
        logTokenAvailability('Final Token Availability', tokenName, tokenAddress, getTokenAvailabilityFinalResult);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
