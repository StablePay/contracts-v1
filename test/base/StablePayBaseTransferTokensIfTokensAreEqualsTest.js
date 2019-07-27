const BigNumber = require('bignumber.js');
const {
    title: t,
} = require('../util/consts');
const withData = require('leche').withData;
const KyberOrderFactory = require('../factories/KyberOrderFactory');

// Mock Smart Contracts
const StablePayBaseMock = artifacts.require("./mock/StablePayBaseMock.sol");
const StandardTokenMock = artifacts.require("./mock/StandardTokenMock.sol");

// Smart Contracts
const Storage = artifacts.require("./base/Storage.sol");

contract('StablePayBaseTransferTokensIfTokensAreEqualsTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];
    const account4 = accounts[4];
    const account5 = accounts[5];

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
        _1_amount100: [account1, account2, '100'],
        _2_amount1000: [account3, account4, '1000']
    }, function(customerAddress, merchantAddress, targetAmount) {
        it(t('anUser', '_transferTokensIfTokensAreEquals', 'Should be able to transfer tokens.', false), async function() {
            // Setup
            const amount = web3.utils.toWei('100000', 'ether');
            const token = await StandardTokenMock.new(customerAddress, amount);
            const orderArray = new KyberOrderFactory({
                sourceToken: token.address,
                targetToken: token.address,
                sourceAmount: targetAmount,
                targetAmount: targetAmount,
                minRate: targetAmount,
                maxRate: targetAmount,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            }).createOrder();
            await token.approve(
                stablePay.address,
                targetAmount,
                {from: customerAddress}
            );
            const customerInitialBalance = await token.balanceOf(customerAddress);
            const merchantInitialBalance = await token.balanceOf(merchantAddress);

            // Invocation
            const result = await stablePay._transferTokensIfTokensAreEquals(orderArray, {from: customerAddress});

            // Assertions
            const customerFinalBalance = await token.balanceOf(customerAddress);
            const merchantFinalBalance = await token.balanceOf(merchantAddress);
            const customerFinal = BigNumber(customerInitialBalance.toString()).minus(BigNumber(customerFinalBalance.toString()));
            const merchantFinal = BigNumber(merchantFinalBalance.toString()).minus(BigNumber(merchantInitialBalance.toString()));
            assert.equal(customerFinal.toString(), targetAmount);
            assert.equal(merchantFinal.toString(), targetAmount);
        });
    });

    withData({
        _1_source105_target100: [account1, account2, '105', '100'],
        _2_source51_target50: [account1, account2, '51', '50']
    }, function(customerAddress, merchantAddress, sourceAmount, targetAmount) {
        it(t('anUser', '_transferTokensIfTokensAreEquals', 'Should be able to transfer tokens (source/target amounts not equals).', false), async function() {
            // Setup
            const amount = web3.utils.toWei('100000', 'ether');
            const token = await StandardTokenMock.new(customerAddress, amount);
            const orderArray = new KyberOrderFactory({
                sourceToken: token.address,
                targetToken: token.address,
                sourceAmount: sourceAmount,
                targetAmount: targetAmount,
                minRate: sourceAmount,
                maxRate: targetAmount,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            }).createOrder();
            await token.approve(
                stablePay.address,
                sourceAmount,
                {from: customerAddress}
            );
            const customerInitialBalance = await token.balanceOf(customerAddress);
            const merchantInitialBalance = await token.balanceOf(merchantAddress);

            // Invocation
            const result = await stablePay._transferTokensIfTokensAreEquals(orderArray, {from: customerAddress});

            // Assertions
            const customerFinalBalance = await token.balanceOf(customerAddress);
            const merchantFinalBalance = await token.balanceOf(merchantAddress);
            const customerFinal = BigNumber(customerInitialBalance.toString()).minus(BigNumber(customerFinalBalance.toString()));
            const merchantFinal = BigNumber(merchantFinalBalance.toString()).minus(BigNumber(merchantInitialBalance.toString()));
            assert.equal(customerFinal.toString(), targetAmount);
            assert.equal(merchantFinal.toString(), targetAmount);
        });
    });

	withData({
        _1_source99_target100: [account1, account2, '99', '100'],
        _2_source25_target0: [account1, account2, '25', '50']
    }, function(customerAddress, merchantAddress, sourceAmount, targetAmount) {
        it(t('anUser', '_transferTokensIfTokensAreEquals', 'Should not be able to transfer tokens (source/target amounts not equals).', true), async function() {
            // Setup
            const amount = web3.utils.toWei('100000', 'ether');
            const token = await StandardTokenMock.new(customerAddress, amount);
            const orderArray = new KyberOrderFactory({
                sourceToken: token.address,
                targetToken: token.address,
                sourceAmount: sourceAmount,
                targetAmount: targetAmount,
                minRate: sourceAmount,
                maxRate: targetAmount,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            }).createOrder();
            await token.approve(
                stablePay.address,
                sourceAmount,
                {from: customerAddress}
            );
            const customerInitialBalance = await token.balanceOf(customerAddress);
            const merchantInitialBalance = await token.balanceOf(merchantAddress);

            try {
                // Invocation
                await stablePay._transferTokensIfTokensAreEquals(orderArray, {from: customerAddress});

                // Assertions
                fail(true, "It should have failed because source amount is < than target amount.")
            } catch (error) {
                // Assertions
                assert(error);
                assert(error.reason, "Not enough allowed tokens to StablePay.");
            }
        });
    });

});