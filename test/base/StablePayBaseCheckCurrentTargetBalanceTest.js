const BigNumber = require('bignumber.js');
const t = require('../util/TestUtil').title;
const withData = require('leche').withData;

// Mock Smart Contracts
const StablePayBaseMock = artifacts.require("./mock/StablePayBaseMock.sol");

// Smart Contracts
const Storage = artifacts.require("./base/Storage.sol");

contract('StablePayBaseCheckCurrentTargetBalanceTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];

    let stablePay;

    beforeEach('Setup', async () => {
        const storageInstance = await Storage.deployed();
        assert(storageInstance);
        assert(storageInstance.address);

        stablePay = await StablePayBaseMock.new(storageInstance.address);
        assert(stablePay);
        assert(stablePay.address);
    });

    withData({
        _1_target10_10_11: ["1", "10", "11", undefined, false],
        _2_target10_10_11: ["100", "100", "200", undefined, false],
        _3_target0_100_100: ["0", "100", "100", undefined, false],
        _4_target1_12_11: ["1", "12", "11", "StablePayBase: Final balance >= initial balance.", true],
        _5_target15_10_30: ["15", "10", "30", "Target final tokens balance is not valid.", true]
    }, function(targetAmount, initialAmount, finalAmount, errorMessageExpected, mustFail) {
        it(t('anUser', 'checkCurrentTargetBalance', 'Should able to check if amounts are valid.', mustFail), async function() {
            //Setup
            const targetAmountWei = web3.utils.toWei(targetAmount, 'ether');
            const initialAmountWei = web3.utils.toWei(initialAmount, 'ether');
            const finalAmountWei = web3.utils.toWei(finalAmount, 'ether');

            try {
                //Invocation
                const result = await stablePay._checkCurrentTargetBalance(targetAmountWei, initialAmountWei, finalAmountWei);
                
                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes(errorMessageExpected));
            }
        });
    });
});