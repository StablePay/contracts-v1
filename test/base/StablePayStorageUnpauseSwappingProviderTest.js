const withData = require('leche').withData;

// Smart Contracts
const StablePayStorageMock = artifacts.require("./StablePayStorageMock.sol");
const Storage = artifacts.require("./Storage.sol");

// Utils
const util = require('ethereumjs-util');
const t = require('../util/TestUtil').title;
const registerProvider  = require('../util/events').registryProvider;

contract('StablePayStorageUnpauseSwappingProviderTest', accounts => {
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
        _1_unpauseByOwner: [account1, account1, true, true, '_5textToBytes1', 'Swapping provider must not be paused by admin.', true],
        _2_unpauseByNonOwner: [account1, account2, true, true, '_5textToBytes2', 'Swapping provider owner is not valid', true],
        _3_unpauseNonExistingProvider: [account1, account1, true, false, '_5textToBytes3', 'Swapping provider must exist', true],
        _4_unpauseNonPausedProvider: [account1, account1, false, true, '_5textToBytes4', 'Swapping provider must be paused.', true]
    }, function(providerOwner, pauseByAccount, paused, exists, providerTextKey, expectedErrorMessage, mustFail) {
        it(t('anUser', 'unpauseSwappingProvider', 'Should be able (or not) to pause a provider.', mustFail), async function() {
            //Setup
            const providerKey = util.bufferToHex(util.setLengthRight(providerTextKey, 32));
            await stablePayStorage._registerSwappingProvider(
                genericSmartContract,
                providerKey,
                providerOwner,
                paused,
                paused,
                exists
            );

            //Invocation
            try {
                const result = await stablePayStorage.unpauseSwappingProvider(providerKey, {from: pauseByAccount});

                // Assertions
                registerProvider
                    .swappingProviderUnpaused(result)
                    .emitted(stablePayStorage.address, genericSmartContract);

                const isPaused = await stablePayStorage.isSwappingProviderPaused(providerKey);

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