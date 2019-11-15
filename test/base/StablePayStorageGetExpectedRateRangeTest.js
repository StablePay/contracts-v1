const withData = require('leche').withData;

// Smart Contracts
const StablePayStorageMock = artifacts.require("./mock/StablePayStorageMock.sol");
const CustomSwappingProviderMock = artifacts.require("./mock/CustomSwappingProviderMock.sol");
const Storage = artifacts.require("./base/Storage.sol");
const StablePay = artifacts.require("./StablePay.sol");

// Utils
const {
    title:t,
    toBytes32,
} = require('../util/consts');

contract('StablePayStorageGetExpectedRateRangeTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];

    let stablePayStorage;
    let storageInstance;

    beforeEach('beforeEach', async () => {
        storageInstance = await Storage.deployed();
        assert(storageInstance);
        assert(storageInstance.address);

        stablePayStorage = await StablePayStorageMock.new(storageInstance.address, {from: owner});
        assert(stablePayStorage);
        assert(stablePayStorage.address);
    });

    const provider1 = {
        isSupported: true,
        minRate: "2",
        maxRate: "2.2",
        owner,
        paused: false,
        providerText: 'textToBytes1'
    };

    const provider2 = {
        isSupported: true,
        minRate: "1.8",
        maxRate: "2.0",
        owner,
        paused: false,
        providerText: 'textToBytes2'
    };

    const notSupportedProvider3 = {
        isSupported: false,
        minRate: "1.8",
        maxRate: "2.0",
        owner,
        paused: false,
        providerText: 'textToBytes3'
    };

    const pausedProvider4 = {
        isSupported: true,
        minRate: "1.8",
        maxRate: "2.0",
        owner,
        paused: true,
        providerText: 'textToBytes4'
    };

    const zeroProviderExpected = {minRate:'0', maxRate: '0'};

    withData({
        _1_with0Providers: [[], zeroProviderExpected],
        _2_with2Providers: [[provider1, provider2], {minRate: provider2.minRate, maxRate: provider1.maxRate}],
        _3_with1NotSupportedProvider: [[notSupportedProvider3], zeroProviderExpected],
        _4_with1PausedProvider: [[pausedProvider4], zeroProviderExpected],
        _5_with5PausedProvider: [[provider1, provider2, notSupportedProvider3, pausedProvider4], {minRate: provider2.minRate, maxRate: provider1.maxRate}],
    }, function(providers, rateExpected) {
        it(t('anUser', 'getExpectedRateRange', 'Should be able to get expected rate range.', false), async function() {
            //Setup
            const newStablePay = await StablePay.new(storageInstance.address);
            for (const providerData of providers) {
                const minRateWei = await web3.utils.toWei(providerData.minRate, 'ether');
                const maxRateWei = await web3.utils.toWei(providerData.maxRate, 'ether');
                const newSwappingProvider = await CustomSwappingProviderMock.new(newStablePay.address);
                await newSwappingProvider.setExpectedRate(providerData.isSupported, minRateWei, maxRateWei);
                const providerKey = toBytes32(providerData.providerText);
                await stablePayStorage.registerSwappingProvider(
                    newSwappingProvider.address,
                    providerKey, {
                        from: providerData.owner
                    }
                );
                await stablePayStorage.unpauseByAdminSwappingProvider(
                    providerKey, {
                        from: owner // By Admin
                    }
                );
                if(providerData.paused) {
                    await stablePayStorage.pauseByAdminSwappingProvider(
                        providerKey, {
                            from: providerData.owner
                        }
                    );  
                }
            }

            //Invocation
            const result = await stablePayStorage.getExpectedRateRange(account1, account2, "1");

            // Assertions
            const minRateExpected = await web3.utils.toWei(rateExpected.minRate, 'ether');
            const maxRateExpected = await web3.utils.toWei(rateExpected.maxRate, 'ether');
            assert.equal(result.minRate.toString(), minRateExpected);
            assert.equal(result.maxRate.toString(), maxRateExpected);
        });
    });
});