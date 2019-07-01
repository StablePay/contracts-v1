/**
    Purpose:
    It gets the expected rate for a specific swapping provider.

    How do I execute this script?

    truffle exec ./scripts/getExpectedRate.js --network infuraRopsten
 */
const appConfig = require('../src/config');

 // Smart contracts
const Upgrade = artifacts.require("./base/Upgrade.sol");
const StablePayBase = artifacts.require("./base/StablePayBase.sol");

// Util classes
const util = require('util');
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const storageAddress = undefined;
const stablepayBaseName = "StablePayBase";
const upgradeAddress = undefined;
const senderIndex = 0;

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`);
        const envConf = require('../config')(network);
        const maxGasForDeploying = envConf.maxGas;
        assert(maxGasForDeploying, `Max gas value for network 'config/${network}.js' is not defined.`);
        
        assert(storageAddress, 'Storage address is undefined.');
        assert(upgradeAddress, 'Upgrade address is undefined.');

        const upgradeInstance = await Upgrade.at(upgradeAddress);
        assert(upgradeInstance, "Upgrade instance is undefined.");
        assert(upgradeInstance.address, "Upgrade address instance is undefined.");

        const accounts = await web3.eth.getAccounts();
        const sender = accounts[senderIndex];

        const newStablePayBase = await StablePayBase.new(
            storageAddress,
            {
                from: sender,
                gas: maxGasForDeploying,
            }
        );
        assert(newStablePayBase, "New StablePayBase instance is undefined.");
        assert(newStablePayBase.address, "New StablePayBase address instance is undefined.");
        console.log(`New ${stablepayBaseName} instance deployed at address ${newStablePayBase.address}.`);

        const upgradeContractResult = await upgradeInstance.upgradeContract(
            stablepayBaseName,
            newStablePayBase.address,
            {
                from: sender,
            }
        );

        assert(upgradeContractResult, "Upgrading contract failed.");
        console.log(util.inspect(upgradeContractResult, {showHidden: false, depth: null}));

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
