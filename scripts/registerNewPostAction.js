/**
    Purpose:
    It registers a new post action in the platform.

    How do I execute this script?

    truffle exec ./scripts/registerNewPostAction.js --network infuraRopsten
 */

// Smart contracts
const IRegistration = artifacts.require("./interface/IRegistration.sol");
const IPostActionRegistry = artifacts.require("./interface/IPostActionRegistry.sol");

// Util classes
const assert = require('assert');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const senderIndex = 0;
const contractName = 'CompoundMintPostAction2';
const ContractToDeploy = artifacts.require("./base/action/CompoundMintPostAction.sol");
const CompoundSettingsName = 'CompoundSettings';

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;

        console.log('NOTES:\n');
        console.log('\t - Verify constructor parameters for the contract to deploy.');
        console.log('\t - Verify contract name is not already registered in platform.');
        
        const postActionRegistryAddress = stablepayContracts.PostActionRegistry;
        assert(postActionRegistryAddress, "PostActionRegistry address is undefined.");
        const registrationAddress = stablepayContracts.Registration;
        assert(registrationAddress, "Registration address is undefined.");
        const storageAddress = stablepayContracts.Storage;
        assert(storageAddress, "Storage address is undefined.");
        const compoundSettingsAddress = stablepayContracts[CompoundSettingsName];
        assert(compoundSettingsAddress, "Compound settings address is undefined.");

        const registration = await IRegistration.at(registrationAddress);
        assert(registration, "Registration instance is undefined.");
        assert(registration.address, "Registration address is undefined.");

        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");

        const sender = accounts[senderIndex];
        assert(sender, "Sender must be defined.");

        console.log('Parameters: ');
        console.log(`Storage Address: ${storageAddress}`);
        console.log(`Compound Settings Address: ${compoundSettingsAddress}`);
        const newContractInstance = await ContractToDeploy.new(storageAddress, compoundSettingsAddress);
        assert(newContractInstance, "New contract instance is undefined.");
        assert(newContractInstance.address, "New contract address is undefined.");

        console.log(`New Post Action Instance Address: ${newContractInstance.address}`);

        const registerContractResult = await registration.registerContract(
            contractName,
            newContractInstance.address, {
                from: sender
            }
        );
        assert(registerContractResult, 'Register contract is undefined.');
        console.log(`Contract name ${contractName} registered with address ${newContractInstance.address}.`);

        const postActionRegistry = await IPostActionRegistry.at(postActionRegistryAddress);

        const registerPostActionResult = await postActionRegistry.registerPostAction(
            newContractInstance.address, {
                from: sender
            }
        );
        assert(registerPostActionResult, 'Register post action result is undefined.');
        console.log(`Contract ${newContractInstance.address} registered as post action.`);

        const isRegisteredPostActionResult = await postActionRegistry.isRegisteredPostAction(newContractInstance.address);
        assert(isRegisteredPostActionResult.toString() === 'true', 'Post action is not registered.');

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
