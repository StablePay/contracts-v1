const {
    title: t,
} = require('../util/consts');
const withData = require('leche').withData;
const KyberOrderFactory = require('../factories/KyberOrderFactory');

// Smart Contracts
const StablePayBaseMock = artifacts.require("./mock/StablePayBaseMock.sol");
const Storage = artifacts.require("./base/Storage.sol");
const Settings = artifacts.require("./base/Settings.sol");

contract('StablePayBaseGetFeeAmountTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const token1 = accounts[7];
    const token2 = accounts[8];

    let stablePay;
    let settings;

    beforeEach('Setup', async () => {
        settings = await Settings.deployed();
        assert(settings);
        assert(settings.address);

        const storageInstance = await Storage.deployed();
        assert(storageInstance);
        assert(storageInstance.address);

        stablePay = await StablePayBaseMock.new(storageInstance.address);
        assert(stablePay);
        assert(stablePay.address);
    });

    withData({
        _1_amount100_fee1: [account1, '100', 1 * 100, '1'],
        _2_amount1000_fee1: [account1, '1000', 1 * 100, '10'],
        _3_amount100_fee10: [account1, '100', 10 * 100, '10'],
        _4_amount100_fee0_5: [account1, '100000', 0.5 * 100, '500'],
        _5_amount100_fee0: [account1, '100', 0 * 100, '0'],
        _6_amount100_fee100: [account1, '100', 100 * 100, '100'],
    }, function(merchantAddress, targetAmount, platformFeeNumber, feeAmountExpected) {
        it(t('anUser', 'getFeeAmount', 'Should be able to get the fee amount.', false), async function() {
            //Setup
            const platformFeeString = platformFeeNumber.toString();

            await settings.setPlatformFee(platformFeeString, {from: owner});
            const orderArray = new KyberOrderFactory({
                sourceToken: token1,
                targetToken: token2,
                sourceAmount: '1',
                targetAmount: targetAmount,
                minRate: '10',
                maxRate: '20',
                merchantAddress: merchantAddress,
                customerAddress: merchantAddress
            }).createOrder();
            
            //Invocation
            const result = await stablePay._getFeeAmount(orderArray);

            // Assertions
            assert(result);
            assert.equal(result.toString(), feeAmountExpected);
        });
    });
});