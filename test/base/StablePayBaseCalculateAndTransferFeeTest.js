const BigNumber = require('bignumber.js');
const {
    title: t,
} = require('../util/consts');
const withData = require('leche').withData;
const KyberOrderFactory = require('../factories/KyberOrderFactory');

// Mock Smart Contracts
const StablePayBaseMock = artifacts.require("./mock/StablePayBaseMock.sol");
const StandardTokenMock = artifacts.require("./mock/token/StandardTokenMock.sol");

// Smart Contracts
const Storage = artifacts.require("./base/Storage.sol");
const Settings = artifacts.require("./base/Settings.sol");
const Vault = artifacts.require("./base/Vault.sol");

contract('StablePayBaseCalculateAndTransferFeeTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];
    const account4 = accounts[4];
    const account5 = accounts[5];

    let stablePay;
    let settings;
    let vault;

    beforeEach('Setup', async () => {
        const storageInstance = await Storage.deployed();
        assert(storageInstance);
        assert(storageInstance.address);

        stablePay = await StablePayBaseMock.new(storageInstance.address);
        assert(stablePay);
        assert(stablePay.address);

        settings = await Settings.deployed();
        assert(settings);
        assert(settings.address);

        vault = await Vault.deployed();
        assert(vault);
        assert(vault.address);
    });

    withData({
        _1_fee0_amount100_feeAmount0: [0, account1, account2, '100', '0'],
        _2_fee1_amount100_feeAmount1: [1, account1, account2, '100', '1']
    }, function(platformFee, customerAddress, merchantAddress, targetAmount, platformFeeAmountExpected) {
        it(t('anUser', '_calculateAndTransferFee', 'Should be able to calculate and transfer fee.', false), async function() {
            // Setup
            const platformFeeValue = 100 * platformFee;
            await settings.setPlatformFee(platformFeeValue.toString(), { from: owner });

            const amount = web3.utils.toWei('10000000000', 'ether');
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
            await token.transfer(
                stablePay.address,
                targetAmount,
                {from: customerAddress}
            );
            const vaultInitialBalance = await token.balanceOf(vault.address);

            // Invocation
            const result = await stablePay._calculateAndTransferFee(orderArray);

            // Assertions
            assert(result);
            const vaultFinalBalance = await token.balanceOf(vault.address);
            const vaultFinal = BigNumber(vaultFinalBalance.toString()).minus(BigNumber(vaultInitialBalance.toString()));
            assert.equal(vaultFinal.toString(), platformFeeAmountExpected);
        });
    });
});