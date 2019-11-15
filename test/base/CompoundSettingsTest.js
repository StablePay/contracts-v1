const _ = require('lodash');
const leche = require('leche');
const withData = leche.withData;

const Mock = artifacts.require("./mock/Mock.sol");
const CompoundSettings = artifacts.require("./base/CompoundSettings.sol");
const t = require('../util/consts').title;
const { compoundSettings } = require('../util/events');

contract('CompoundSettingsTest', function (accounts) {
    const owner = accounts[0];
    const account1 = accounts[1];
    let instance;

    beforeEach('Setup contract for each test', async () => {
        instance = await CompoundSettings.deployed();
        assert(instance, 'Instance is undefined.');
        assert(instance.address, 'Instance address is undefined.');
    });

    withData({
        _1_basic: [accounts[0], accounts[1], owner, undefined, false],
        _2_notOwner: [accounts[0], accounts[1], account1, 'Msg sender does not have permission.', true],
    }, function(tokenAddress, cTokenAddress, fromAddress, messageExpected, mustFail) {
        it(t('anUser/Owner', 'mapErc20ToCEr20', 'Should be able (or not) to map ERC20 / cERC20.', mustFail), async function() {
            //Setup

            try {
                //Invocation
                const result = await instance.mapErc20ToCEr20(
                    tokenAddress,
                    cTokenAddress, {
                        from: fromAddress
                    }
                );

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
                compoundSettings
                    .erc20ToCEr20MappingCreated(result)
                    .emitted(
                        instance.address,
                        tokenAddress,
                        cTokenAddress
                    );
                const cTokenResult = await instance.getCEr20(tokenAddress);
                assert.equal(cTokenResult.toString(), cTokenAddress.toString());
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, messageExpected);
            }
        });
    });

    withData({
        _1_notAbleToMapTwice: [accounts[3], accounts[1], owner],
    }, function(tokenAddress, cTokenAddress, fromAddress) {
        it(t('anUser/Owner', 'mapErc20ToCEr20', 'Should not be able to map ERC20 / cERC20 already mapped.', true), async function() {
            //Setup
            await instance.mapErc20ToCEr20(
                tokenAddress,
                cTokenAddress, {
                    from: fromAddress
                }
            );

            try {
                //Invocation
                const result = await instance.mapErc20ToCEr20(
                    tokenAddress,
                    cTokenAddress, {
                        from: fromAddress
                    }
                );

                // Assertions
                assert(false, 'It should have failed because ERC20 / cERC20 is already mapped.');
            } catch (error) {
                // Assertions
                assert(error);
                assert.equal(error.reason, 'Current CEr20 must be 0x0.');
            }
        });
    });

    withData({
        _1_notSupported_owner: [owner, accounts[4], accounts[2], account1, false],
        _2_notSupported_notOwner: [account1, accounts[5], accounts[2], account1, false],
        _3_supported_owner: [owner, accounts[6], accounts[2], accounts[6], true],
        _4_supported_notOwner: [account1, accounts[7], accounts[2], accounts[7], true],
    }, function(fromAddress, tokenAddress, cTokenAddress, tokenToValidate, supportExpected) {
        it(t('anUser/Owner', 'supportErc20', 'Should be able to verify if .', false), async function() {
            //Setup
            await instance.mapErc20ToCEr20(
                tokenAddress,
                cTokenAddress, {
                    from: owner
                }
            );

            //Invocation
            const result = await instance.supportErc20(
                tokenToValidate, {
                    from: fromAddress
                }
            );

            // Assertions
            assert.equal(result.toString(), supportExpected.toString());
        });
    });

    withData({
        _1_basicUpdate: [accounts[3], accounts[1], owner, undefined, false],
        _2_basicUpdate_notOwner: [accounts[3], accounts[1], account1, 'Msg sender does not have permission.', true],
        _3_currentCTokenIsEmpty: [undefined, accounts[1], owner, 'Current CErc20 must NOT be 0x0.', true],
        _4_currentCTokenIsEqualsToNew: [accounts[3], accounts[3], owner, 'Current CErc20 must NOT be equal to new CErc20.', true],
    }, function(cTokenAddress, newCTokenAddress, fromAddress, messageExpected, mustFail) {
        it(t('anUser/Owner', 'updateMapErc20ToCEr20', 'Should be able (or not) to update the ERC20 / cERC20 mapping.', mustFail), async function() {
            //Setup
            const mock = await Mock.new();
            if(!_.isUndefined(cTokenAddress)) {
                await instance.mapErc20ToCEr20(
                    mock.address,
                    cTokenAddress, {
                        from: owner
                    }
                );
            }

            try {
                //Invocation
                const result = await instance.updateMapErc20ToCEr20(
                    mock.address,
                    newCTokenAddress, {
                        from: fromAddress
                    }
                );

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
                compoundSettings
                    .erc20ToCEr20MappingUpdated(result)
                    .emitted(
                        instance.address,
                        cTokenAddress,
                        mock.address,
                        newCTokenAddress
                    );
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, messageExpected);
            }
        });
    });
});