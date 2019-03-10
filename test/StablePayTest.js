const BigNumber = require('bignumber.js');
const t = require('./util/TestUtil').title;
const withData = require('leche').withData;
const KyberOrderFactory = require('./factories/KyberOrderFactory');

// Smart Contracts
const StablePayMock = artifacts.require("./mock/StablePayMock.sol");
const Storage = artifacts.require("./base/Storage.sol");
const Settings = artifacts.require("./base/Settings.sol");

// Utils
/*
const {
    assertEvent
} = require("./util/event/utils");
const stablePayEvents = require('./util/event/assertEvents').stablePay;
*/

contract('StablePayTest', accounts => {
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

        stablePay = await StablePayMock.new(storageInstance.address);
        assert(stablePay);
        assert(stablePay.address);
    });

    withData({
        _1_amount100_fee1: [account1, '100', 1 * 100, '1'],
        _2_amount1000_fee1: [account1, '1000', 1 * 100, '10'],
        _3_amount100_fee10: [account1, '100', 10 * 100, '10']
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
                merchantAddress: merchantAddress
            }).createOrder();
            
            //Invocation
            const result = await stablePay._getFeeAmount(orderArray);

            // Assertions
            assert(result);
            assert.equal(result.toString(), feeAmountExpected);
        });
    });
});