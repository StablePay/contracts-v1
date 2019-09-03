const withData = require('leche').withData;

// Smart Contracts
const StablePayStorageMock = artifacts.require("./StablePayStorageMock.sol");
const Storage = artifacts.require("./Storage.sol");

// Utils
const {
    title: t,
    toBytes32,
} = require('../util/consts');
const registerProvider  = require('../util/events').registryProvider;

contract('StablePayStorageUnregisterSwappingProviderTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];

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
        _1_valid: [account2, owner, '11111', undefined, false],
        _2_invalidProviderKey: [undefined, owner, '222222', 'Swapping provider must exist.', true],
    }, function(providerAddress, providerOwner, providerTextKey, expectedErrorMessage, mustFail) {
        it(t('anUser', 'unregisterSwappingProvider', 'Should be able (or not) to unregister a provider.', mustFail), async function() {
            //Setup
            const providerKey = toBytes32(providerTextKey);
            if(providerAddress !== undefined) {
                await stablePayStorage.registerSwappingProvider(
                    providerAddress,
                    providerKey,
                    {from: owner}
                );
            }
            const initialProvidersCountResult = await stablePayStorage.getProvidersRegistryCount();

            //Invocation
            try {
                const result = await stablePayStorage.unregisterSwappingProvider(
                    providerKey,
                    {from: providerOwner}
                );

                // Assertions
                registerProvider
                    .swappingProviderUnRegistered(result)
                    .emitted(stablePayStorage.address, providerKey, providerAddress, providerOwner);

                const finalProvidersCountResult = await stablePayStorage.getProvidersRegistryCount();

                assert(!mustFail, 'It should have failed because data is invalid.');
                assert.equal(parseInt(initialProvidersCountResult.toString()), parseInt(finalProvidersCountResult) + 1);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.reason.includes(expectedErrorMessage));
            }
        });
    });
});