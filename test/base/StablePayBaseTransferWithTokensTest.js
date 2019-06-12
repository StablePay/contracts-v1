const BigNumber = require('bignumber.js');
const t = require('../util/TestUtil').title;
const withData = require('leche').withData;
const HardcodedOrderDataBuilder = require('../../src/builder/HardcodedOrderDataBuilder');
const ProviderKeyGenerator = require('../../src/utils/ProviderKeyGenerator');
const { base, stablePayBase} = require('../util/events');

// Mock Smart Contracts
const StablePayStorage = artifacts.require("./base/StablePayStorage.sol");
const Settings = artifacts.require("./base/Settings.sol");
const StablePayBaseMock = artifacts.require("./mock/StablePayBaseMock.sol");
const StandardTokenMock = artifacts.require("./mock/StandardTokenMock.sol");
const SwappingProviderMock = artifacts.require("./mock/SwappingProviderMock.sol");

// Smart Contracts
const Storage = artifacts.require("./base/Storage.sol");

contract('StablePayBaseTransferWithTokensTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const account3 = accounts[3];
    const account4 = accounts[4];
    const account5 = accounts[5];

    let stablePay;
    let stablePayStorage;
    let settings;
    const providerKeyGenerator = new ProviderKeyGenerator();

    beforeEach('Setup', async () => {
        const storageInstance = await Storage.deployed();
        assert(storageInstance);
        assert(storageInstance.address);

        settings = await Settings.deployed();
        assert(settings);
        assert(settings.address);

        stablePayStorage = await StablePayStorage.deployed();
        assert(stablePayStorage);
        assert(stablePayStorage.address);

        stablePay = await StablePayBaseMock.new(storageInstance.address);
        assert(stablePay);
        assert(stablePay.address);
    });

    withData({
        _1_amount100: [account1, account2, '1742909715561031044', '20000000000000000000', "1", "19800000000000000000"]
    }, function(customerAddress, merchantAddress, sourceAmount, targetAmount, extraTargetAmount, merchantAmountExpected) {
        it(t('anUser', 'transferWithTokens', 'Should be able to transfer with tokens.', false), async function() {
            // Setup
            const amount = web3.utils.toWei('100000', 'ether');
            // Create source and target tokens.
            const sourceToken = await StandardTokenMock.new(customerAddress, amount);
            const targetToken = await StandardTokenMock.new(customerAddress, amount);

            // Create a new swapping provider (mock).
            const swappingProvider = await SwappingProviderMock.new(stablePay.address);

            // Generate the key, register it in StablePay, and configure the target token availability.
            const providerKey = providerKeyGenerator.generateKey('CustomProvider', '1');
            await stablePayStorage.registerSwappingProvider(swappingProvider.address, providerKey.providerKey);
            await settings.setTokenAvailability(targetToken.address, "1", targetAmount, { from: owner});

            await sourceToken.approve(
                stablePay.address,
                targetAmount,
                {from: customerAddress}
            );

            const orderDataBuilder = new HardcodedOrderDataBuilder();
            const data = {
                sourceAmount: sourceAmount,
                targetAmount: targetAmount,
                minRate: '11829962571720000000',
                maxRate: '11475063694568399916',
                sourceToken: sourceToken.address,
                targetToken: targetToken.address,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress,
                providerKey: providerKey.providerKey
            };
            const dataResult = await orderDataBuilder.build(data);
            const order = dataResult.order;
            const providers = dataResult.providers;

            await sourceToken.transfer(stablePay.address, sourceAmount, {from: customerAddress});
            await targetToken.transfer(swappingProvider.address, targetAmount, {from: customerAddress});
            await targetToken.transfer(stablePay.address, extraTargetAmount, {from: customerAddress});

            // Invocation
            const result = await stablePay.transferWithTokens(order, providers, {from: customerAddress, gas: 6721900});

            // Assertions
            stablePayBase
                .executionTransferSuccess(result)
                .emitted(stablePay.address, providerKey.providerKey);
            base
                .paymentSent(result)
                .emitted(stablePay.address, merchantAddress, customerAddress, sourceToken.address, targetToken.address, merchantAmountExpected);
        });
    });
});