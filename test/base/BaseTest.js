const withData = require('leche').withData;

const StablePay = artifacts.require("./StablePay.sol");
const ITransferMock = artifacts.require("./interface/ITransferMock.sol");
const Vault = artifacts.require("./base/Vault.sol");
const BaseMock = artifacts.require("./mock/BaseMock.sol");
const Storage = artifacts.require("./base/Storage.sol");
const Role = artifacts.require("./base/Role.sol");
const Settings = artifacts.require("./base/Settings.sol");

const BigNumber = require('bignumber.js');
const t = require('../util/consts').title;

contract('BaseTest', function (accounts) {
    const owner = accounts[0];
    const account1 = accounts[1];

    let base;
    let settings;
    let role;
    let vault;
    
    beforeEach('Setup contract for each test', async () => {
        const storage = await Storage.deployed();

        base = await BaseMock.new(storage.address);
        assert(base);
        assert(base.address);

        settings = await Settings.deployed();
        assert(settings);
        assert(settings.address);

        role = await Role.deployed();
        assert(role);
        assert(role.address);

        vault = await Vault.deployed();
        assert(vault);
        assert(vault.address);
    });

    withData({
        _1_pause_mustFail: [true, 'Platform is paused.',  true],
        _2_unpause_noMustFail: [false, undefined, false]
    }, function(pausePlatform, messageExpected, mustFail) {
        it(t('anUser', '_isNotPaused', 'Should be able (or not) to execute function with/without paused platform.', mustFail), async function() {
            // Setup
            const isPausedPlatformInitial = await settings.isPlatformPaused();
            if(pausePlatform && !isPausedPlatformInitial) {
                await settings.pausePlatform('Pause reason', {from: owner});
            }

            // Invocation
            try {
                await base._isNotPaused();
                // Assertions
                assert(!mustFail, "It should not have failed.");
            } catch (error) {
                // Assertions
                assert(mustFail, "It should have failed.");
                assert(error.message.includes(messageExpected));
            }

            const isPausedPlatformFinal = await settings.isPlatformPaused();
            if(isPausedPlatformFinal) {
                await settings.unpausePlatform('Unpause reason', {from: owner});
            }
        });
    });

    withData({
        _1_owner_mustNotFail: [owner, undefined,  false],
        _2_acount1_mustFail: [account1, 'Invalid role', true]
    }, function(address, messageExpected, mustFail) {
        it(t('anUser', '_onlyOwner', 'Should be able (or not) to execute function only for owners.', mustFail), async function() {
            // Setup

            // Invocation
            try {
                await base._onlyOwner({ from: address});
                // Assertions
                assert(!mustFail, "It should not have failed.");
            } catch (error) {
                // Assertions
                assert(mustFail, "It should have failed.");
                assert(error.message.includes(messageExpected));
            }
        });
    });

    withData({
        _1_1ether: ['1', undefined, false],
        _2_0ether: ['0', 'Msg value must be gt 0.', true]
    }, function(amount, messageExpected, mustFail) {
        it(t('anUser', 'fallback', 'Should be able to transfer ether.', mustFail), async function() {
            //Setup
            const vault = await Vault.deployed();
            const stablePayProxy = await StablePay.deployed();
            const transferMock = await ITransferMock.at(stablePayProxy.address);
            const vaultInitialBalance = await web3.eth.getBalance(transferMock.address);
            const amountWei = await web3.utils.toWei(amount, 'ether');
            
            //Invocation
            try {
                //Invocation
                const result = await transferMock.transferEther({ value: amountWei});

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
                const vaultFinalBalance = await web3.eth.getBalance(transferMock.address);
                assert.equal(amountWei, BigNumber(vaultFinalBalance.toString()).minus(BigNumber(vaultInitialBalance.toString())));
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, messageExpected);
            }
        });
    });

    withData({
        _1_1ether: ['1', undefined, false],
        _2_0ether: ['0', 'Balance must be gt 0.', true]
    }, function(amount, messageExpected, mustFail) {
        it(t('anUser', 'transferEthersToVault', 'Should be able to transfer ether to Vault.', mustFail), async function() {
            //Setup
            const amountWei = await web3.utils.toWei(amount, 'ether');
            const castedBase = await ITransferMock.at(base.address);
            if(amount !== '0') {
                await castedBase.transferEther({value: amountWei});
            }
            const initialVaultBalance = await web3.eth.getBalance(vault.address);
            
            //Invocation
            try {
                //Invocation
                const result = await base.transferEthersToVault();

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);

                const finalVaultBalance = await web3.eth.getBalance(vault.address);
                assert.equal(BigNumber(finalVaultBalance.toString()), BigNumber(initialVaultBalance.toString()).plus(BigNumber(amountWei.toString())).toString());
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, messageExpected);
            }
        });
    });
});