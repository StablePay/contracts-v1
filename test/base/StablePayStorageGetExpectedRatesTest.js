const withData = require('leche').withData;

// Smart Contracts
const StablePayStorageMock = artifacts.require("./mock/StablePayStorageMock.sol");
const CustomSwappingProviderMock = artifacts.require("./mock/CustomSwappingProviderMock.sol");
const Storage = artifacts.require("./base/Storage.sol");
const StablePay = artifacts.require("./StablePay.sol");

// Utils
const {
    title: t,
    toBytes32,
} = require('../util/consts');

contract('StablePayStorageGetExpectedRatesTest', accounts => {
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
        owner: account1,
        paused: false,
        providerText: 'textToBytes1'
    };

    const provider2 = {
        isSupported: true,
        minRate: "1.8",
        maxRate: "2.0",
        owner: account2,
        paused: false,
        providerText: 'textToBytes2'
    };

    const notSupportedProvider3 = {
        isSupported: true,
        minRate: "1.8",
        maxRate: "2.0",
        owner: account2,
        paused: false,
        providerText: 'textToBytes3'
    };

    const pausedProvider4 = {
        isSupported: true,
        minRate: "1.8",
        maxRate: "2.0",
        owner: account2,
        paused: true,
        providerText: 'textToBytes4'
    };

    withData({
        _1_with0Providers: [[], 0],
        _2_with2Providers: [[provider1, provider2], 2],
        _3_with1NotSupportedProvider: [[notSupportedProvider3], 1],
        _4_with1PausedProvider: [[pausedProvider4], 0],
        _5_with5PausedProvider: [[provider1, provider2, notSupportedProvider3, pausedProvider4], 3]
    }, function(providers, expectedCount) {
        it(t('anUser', 'getExpectedRates', 'Should be able to get expected rates.', false), async function() {
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
                if(providerData.paused) {
                    await stablePayStorage.pauseSwappingProvider(
                        providerKey, {
                            from: providerData.owner
                        }
                    );  
                }
            }

            //Invocation
            const result = await stablePayStorage.getExpectedRates(account1, account2, "1");

            // Assertions
            const resultProviders = result.filter(provider => provider.isSupported);
            assert.equal(resultProviders.length, expectedCount);
        });
    });
});