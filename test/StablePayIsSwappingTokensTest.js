const BigNumber = require('bignumber.js');
const t = require('./util/TestUtil').title;
const withData = require('leche').withData;
const KyberOrderFactory = require('./factories/KyberOrderFactory');

// Mock Smart Contracts
const StablePayMock = artifacts.require("./mock/StablePayMock.sol");
const StandardTokenMock = artifacts.require("./mock/StandardTokenMock.sol");

// Smart Contracts
const Storage = artifacts.require("./base/Storage.sol");

contract('StablePayIsSwappingTokensTest', accounts => {
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

        stablePay = await StablePayMock.new(storageInstance.address);
        assert(stablePay);
        assert(stablePay.address);
    });

    withData({
        _1_amount100: [account1, account2, '100'],
        _2_amount1000: [account3, account4, '1000']
    }, function(customerAddress, merchantAddress, targetAmount) {
        it(t('anUser', '_isTransferTokens', 'Should be able to transfer tokens.', false), async function() {
            //Setup
            const amount = web3.utils.toWei('100000', 'ether');
            const token = await StandardTokenMock.new(customerAddress, amount);
            const orderArray = new KyberOrderFactory({
                sourceToken: token.address,
                targetToken: token.address,
                sourceAmount: targetAmount,
                targetAmount: targetAmount,
                minRate: targetAmount,
                maxRate: targetAmount,
                merchantAddress: merchantAddress
            }).createOrder();
            await token.approve(
                stablePay.address,
                targetAmount,
                {from: customerAddress}
            );
            const customerInitialBalance = await token.balanceOf(customerAddress);
            const merchantInitialBalance = await token.balanceOf(merchantAddress);

            //Invocation
            const result = await stablePay._isTransferTokens(orderArray, {from: customerAddress});
            const customerFinalBalance = await token.balanceOf(customerAddress);
            const merchantFinalBalance = await token.balanceOf(merchantAddress);
            const customerFinal = BigNumber(customerInitialBalance.toString()).minus(BigNumber(customerFinalBalance.toString()));
            const merchantFinal = BigNumber(merchantFinalBalance.toString()).minus(BigNumber(merchantInitialBalance.toString()));
            assert.equal(customerFinal.toString(), targetAmount);
            assert.equal(merchantFinal.toString(), targetAmount);
        });
    });
});