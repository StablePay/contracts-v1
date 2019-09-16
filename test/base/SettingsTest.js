const leche = require('leche');
const withData = leche.withData;

const Settings = artifacts.require("./base/Settings.sol");
const Mock = artifacts.require("./mock/Mock.sol");
const {
    title: t,
     NULL_ADDRESS,
} = require('../util/consts');
const settings = require('../util/events').settings;

contract('SettingsTest', function (accounts) {
    const owner = accounts[0];
    const account1 = accounts[1];
    let instance;

    beforeEach('Setup contract for each test', async () => {
        instance = await Settings.deployed();
    });

    withData({
        _1_basic: []
    }, function() {
        it(t('anUser', 'getPlatformFee', 'Should be able to get the current platform fee.', false), async function() {
            //Setup
            
            //Invocation
            const result = await instance.getPlatformFee();

            // Assertions
            assert(result);
        });
    });

    withData({
        _1_owner_100: [owner, "100", '', false],
        _2_account1_100: [account1, "100", 'Msg sender does not have permission.', true]
    }, function(userAccount, newPlatformFee, expectedMessage, mustFail) {
        it(t('anUser', 'setPlatformFee', 'Should be able to get the current platform fee.', false), async function() {
            //Setup
            const oldPlatformFee = await instance.getPlatformFee();
            
            try {
                //Invocation
                const result = await instance.setPlatformFee(newPlatformFee, {from: userAccount});

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                settings
                    .platformFeeUpdated(result)
                    .emitted(instance.address, oldPlatformFee, newPlatformFee);

                const newPlatformFeeResult = await instance.getPlatformFee();
                assert(newPlatformFeeResult);
                assert.equal(newPlatformFeeResult.toString(), newPlatformFee);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, expectedMessage);
            }
        });
    });

    withData({
        _1_owner: [owner, "Pause platform I", undefined, false],
        _2_account1_invalid: [account1, "Pause platform II", 'Msg sender does not have permission.', true]
    }, function(userAccount, reason, expectedMessage, mustFail) {
        it(t('anUser', 'pausePlatform', 'Should be able (or not) to pause the platform.', mustFail), async function() {
            //Setup
            try {
                //Invocation
                const result = await instance.pausePlatform(reason, {from: userAccount});

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                settings
                    .platformPaused(result)
                    .emitted(instance.address, reason);
                const isPlatformPausedResult = await instance.isPlatformPaused();
                assert(isPlatformPausedResult);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, expectedMessage);
            } finally {
                if(!mustFail) {
                    await instance.unpausePlatform(reason, {from: owner});
                }
            }
        });
    });

    withData({
        _1_owner: [owner, "Pause platform I", false, undefined, false],
        _2_notOwner: [account1, "Pause platform II", false, 'Msg sender does not have permission.', true],
    }, function(userAccount, reason, isPlatformPausedExpected, expectedMessage, mustFail) {
        it(t('anUser', 'unpausePlatform', 'Should be able to get the current platform fee.', mustFail), async function() {
            //Setup
            const isPlatformPausedResult = await instance.isPlatformPaused();
            if (!isPlatformPausedResult) {
                await instance.pausePlatform('Needed to test it.', {from: owner});
            }

            try {
                //Invocation
                const result = await instance.unpausePlatform(reason, {from: userAccount});

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
                settings
                    .platformUnpaused(result)
                    .emitted(instance.address, reason);
                const isPlatformPausedResult = await instance.isPlatformPaused();
                assert.equal(isPlatformPausedResult, isPlatformPausedExpected);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, expectedMessage);
            } finally {
                const isPlatformPausedResult = await instance.isPlatformPaused();
                if (isPlatformPausedResult) {
                    await instance.unpausePlatform(reason, {from: owner});
                }
            }
        });
    });

    withData({
        _1_isNotPaused: [false, false],
        _2_isPaused: [true, true],
    }, function(pauseBefore, isPlatformPausedExpected) {
        it(t('anUser', 'isPlatformPaused', 'Should be able to get the current platform status.', false), async function() {
            //Setup
            if (pauseBefore) {
                await instance.pausePlatform('Needed to test it I.', {from: owner});
            }

            //Invocation
            const result = await instance.isPlatformPaused();

            // Assertions
            assert.equal(result, isPlatformPausedExpected);

            if (pauseBefore) {
                await instance.unpausePlatform('Needed to test it II', {from: owner});
            }
        });
    });

    withData({
        _1_basic: [owner, '100', '1000', undefined, false],
        _2_emptyTokenAddress: [NULL_ADDRESS, '100', '1000', 'Token address must not be eq 0x0.', true],
        _3_minValue0: [owner, '0', '1000', 'Min amount is not gt 0.', true],
        _4_maxValue_lg_minValue: [owner, '100', '0', 'Min amount is not lt max amount.', true],
    }, function(tokenAddressString, minValue, maxValue, expectedMessage, mustFail) {
        it(t('anUser', 'setTokenAvailability', 'Should be able (or not) to set token availability.', mustFail), async function() {
            //Setup
            let tokenAddress = tokenAddressString;
            if(tokenAddress !==  NULL_ADDRESS) {
                const mock = await Mock.new();
                tokenAddress = mock.address;
            }

            try {
                //Invocation
                const result = await instance.setTokenAvailability(tokenAddress, minValue, maxValue);

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
                settings
                    .tokenAvailabilityUpdated(result)
                    .emitted(instance.address, tokenAddress, minValue, maxValue, true);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, expectedMessage);
            }
        });
    });

    withData({
        _1_basic: [undefined, undefined, false],
        _2_emtpyToken: [NULL_ADDRESS, 'Token address must not be eq 0x0.', true],
        _3_emtpyToken: [NULL_ADDRESS, 'Token address must not be eq 0x0.', true],
    }, function(tokenToDisableAddressString, expectedMessage, mustFail) {
        it(t('anUser', 'disableTokenAvailability', 'Should be able (or not) to disable token availability.', mustFail), async function() {
            //Setup
            const minValue = '1';
            const maxValue = '10';
            const token = await Mock.new();
            await instance.setTokenAvailability(token.address, minValue, maxValue);

            let tokenToDisableAddress = tokenToDisableAddressString;
            if(tokenToDisableAddressString === undefined) {
                tokenToDisableAddress = token.address;
            }

            try {
                //Invocation
                const result = await instance.disableTokenAvailability(tokenToDisableAddress);

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
                settings
                    .tokenAvailabilityUpdated(result)
                    .emitted(instance.address, tokenToDisableAddress, '0', '0', false);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, expectedMessage);
            }
        });
    });
});