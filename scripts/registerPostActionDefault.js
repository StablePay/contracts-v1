/**
    Purpose:
    It pauses a specific swapping provider using the name defined in the stablepay.js configuration.

    How do I execute this script?

    truffle exec ./scripts/registerPostActionDefault.js --network infuraRopsten
 */

// Smart contracts
const IPostActionRegistry = artifacts.require("./interface/IPostActionRegistry.sol");

// Util classes
const util = require('util');
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const ProviderKeyGenerator = require('../src/utils/ProviderKeyGenerator');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const senderIndex = 0;
const postActionContractName = 'TransferToPostAction';

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;
        
        const postActionAddress = stablepayContracts[postActionContractName];
        assert(postActionAddress, 'Post action address is undefined');
        
        const postActionRegistry = await IPostActionRegistry.at(stablepayContracts.PostActionRegistry);
        assert(postActionRegistry.address, "Post action registry address is undefined.");

        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");

        const sender = accounts[senderIndex];
        assert(sender, "Sender must be defined.");

        const setPostActionAsDefaultResult = await postActionRegistry.setPostActionAsDefault(postActionAddress);
        assert(setPostActionAsDefaultResult, 'Set post action as default is undefined.');

        const isRegisteredPostActionResult = await postActionRegistry.isRegisteredPostAction(postActionAddress);
        assert(isRegisteredPostActionResult.toString() === 'true', 'Post action is not registered.');

        const getPostActionOrDefaultResult = await postActionRegistry.getDefaultPostAction();
        assert(getPostActionOrDefaultResult.toString() === postActionAddress, 'Post action is not registered.');

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
