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

contract('StablePayStorageUnpauseByAdminSwappingProviderTest', accounts => {
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
        _1_unpauseByOwner: [account1, owner, true, true, '_5textToBytes1', undefined, false],
        _2_unpauseByNonOwner: [account1, account2, true, true, '_5textToBytes2', 'Msg sender does not have permission.', true],
        _3_unpauseNonExistingProvider: [account1, account1, true, false, '_5textToBytes3', 'Swapping provider must exist', true],
        _4_unpauseNonPausedProvider: [account1, owner, false, true, '_5textToBytes4', 'Swapping provider must be paused.', true]
    }, function(providerOwner, pauseByAccount, paused, exists, providerTextKey, expectedErrorMessage, mustFail) {
        it(t('anUser', 'unpauseByAdminSwappingProvider', 'Should be able (or not) to pause a provider.', mustFail), async function() {
            //Setup
            const providerKey = toBytes32(providerTextKey);
            await stablePayStorage._registerSwappingProvider(
                genericSmartContract,
                providerKey,
                providerOwner,
                paused,
                exists
            );

            //Invocation
            try {
                const result = await stablePayStorage.unpauseByAdminSwappingProvider(providerKey, {from: pauseByAccount});

                // Assertions
                registerProvider
                    .swappingProviderUnpaused(result)
                    .emitted(stablePayStorage.address, genericSmartContract);

                const isPaused = await stablePayStorage.isSwappingProviderPaused(providerKey);
                console.log(isPaused);

                assert(!isPaused);
                assert(!mustFail, 'It should have failed because data is invalid.');
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes(expectedErrorMessage));
            }
        });
    });
});