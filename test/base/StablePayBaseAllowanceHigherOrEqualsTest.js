const {
    title: t,
} = require('../util/consts');
const withData = require('leche').withData;

// Mock Smart Contracts
const StandardTokenMock = artifacts.require("./mock/token/StandardTokenMock.sol");
const StablePayBaseMock = artifacts.require("./mock/StablePayBaseMock.sol");

// Smart Contracts
const Storage = artifacts.require("./base/Storage.sol");

contract('StablePayBaseAllowanceHigherOrEqualsTest', accounts => {
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
        _1_approve1000_amount1000: [account1, account2, account3, "1000", "1000", false],
        _2_approve100_amount1000: [account1, account2, account3, "100", "1000", true]
    }, function(tokenOwner, from, to, approveAmount, amount, mustFail) {
        it(t('anUser', 'allowanceHigherOrEquals', 'Should be able to check allowance.', mustFail), async function() {
            //Setup
            const supply = web3.utils.toWei('100000000000', 'ether');
            const approveAmountWei = web3.utils.toWei(approveAmount, 'ether');
            const amountWei = web3.utils.toWei(amount, 'ether');
            
            const token = await StandardTokenMock.new(tokenOwner, supply);
            await token.approve(stablePay.address, approveAmountWei, { from: from});

            try {
                //Invocation
                const result = await stablePay._allowanceHigherOrEquals(token.address, from, stablePay.address, amountWei);

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes("Not enough allowed tokens to StablePay."));
            }
        });
    });
});