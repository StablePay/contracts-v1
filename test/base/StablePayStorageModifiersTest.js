const withData = require('leche').withData;

// Smart Contracts
const StablePayStorageMock = artifacts.require("./StablePayStorageMock.sol");
const Storage = artifacts.require("./Storage.sol");

// Utils
const {
    title: t,
    toBytes32,
} = require('../util/consts');

contract('StablePayStorageModifiersTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    const genericSmartContract = accounts[8];

    let stablePayStorage;

    beforeEach('beforeEach', async () => {
        const storageInstance = await Storage.deployed();
        assert(storageInstance);
        assert(storageInstance.address);

        stablePayStorage = await StablePayStorageMock.new(storageInstance.address, {from: owner});
        assert(stablePayStorage);
        assert(stablePayStorage.address);
    });

    withData({
        _1_withValidProviderKey: [account1, account1, 'textToBytes1', false],
        _2_withInvalidProviderKey: [account1, account2, 'textToBytes2', true]
    }, function(providerOwner, accountToTest, providerTextKey, mustFail) {
        it(t('anUser', '_isSwappingProviderOwner', 'Should be able to test if an address is the owner.', mustFail), async function() {
            //Setup
            const providerKey = toBytes32(providerTextKey);
            await stablePayStorage.registerSwappingProvider(
                genericSmartContract,
                providerKey, {
                    from: providerOwner
                }
            );

            //Invocation
            try {
                await stablePayStorage._isSwappingProviderOwner(
                    providerKey,
                    accountToTest
                );

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes("Swapping provider owner is not valid."));
            }
        });
    });

    withData({
        _1_newProviderAndOwner: [account1, true, account1, 'textToBytes1', false],
        _2_newProviderAndNotOwner: [account1, true, account2, 'textToBytes2', true]
    }, function(providerOwner, exists, providerOwnerToTest, providerTextKey, mustFail) {
        it(t('anUser', '_isSwappingProviderNewOrUpdate', 'Should be able to test if registration is new or update.', mustFail), async function() {
            //Setup
            const providerKey = toBytes32(providerTextKey);
            await stablePayStorage._registerSwappingProvider(
                genericSmartContract,
                providerKey,
                providerOwner,
                false,
                false,
                exists
            );

            //Invocation
            try {
                await stablePayStorage._isSwappingProviderNewOrUpdate(
                    providerKey,
                    providerOwnerToTest
                );

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes("Swapping provider must be new or an update by owner."));
            }
        });
    });
});