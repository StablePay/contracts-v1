/**
    Purpose:
    It registers an address in Kyber Network Fee Sharing Program.

    How do I execute this script?

    truffle exec ./scripts/registerKyberFeeSharingProgram.js --network infuraRopsten
 */
const appConfig = require('../src/config');

// Smart contracts
const KyberRegisterWallet = artifacts.require("./services/kyber/KyberRegisterWallet.sol");

// Util classes
const util = require('util');
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const addressToRegisterIndex = 1;

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)

        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");
        const addressToRegister = accounts[addressToRegisterIndex];
        assert(addressToRegister, "Sender must be defined.");

        const getKyberAddressFeeResult = appConfig.getKyberAddressFee().get();
        assert.equal(addressToRegister, getKyberAddressFeeResult, 'Kyber fee address in .env and this script are not equal.');

        const kyberConf = appConf.kyber;
        const kyberRegisterWalletAddress = kyberConf.KyberRegisterWallet;
        assert(kyberRegisterWalletAddress, 'Kyber register wallet address is undefined.');

        const kyberRegisterWalletInstance = await KyberRegisterWallet.at(kyberRegisterWalletAddress);
        assert(kyberRegisterWalletInstance, 'Kyber register wallet instance is undefined.');

        const registerAddressResult = await kyberRegisterWalletInstance.registerAddress(
            addressToRegister,
            {
                from: addressToRegister,
            }
        );
        
        assert(registerAddressResult, "Register address failed.");
        console.log(util.inspect(registerAddressResult, {showHidden: false, depth: null}));

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
