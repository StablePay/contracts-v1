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

contract('StablePayStoragePauseByAdminSwappingProviderTest', accounts => {
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
        _1_pauseByOwner: [owner, owner, true, 'textToBytes1', undefined, false],
        _2_pauseByNonOwner: [account1, account2, true, 'textToBytes2', 'Msg sender does not have permission.', true],
        _3_pauseNonExistingProvider: [account1, account1, false, 'textToBytes3', 'Swapping provider must exist', true]
    }, function(providerOwner, pauseByAccount, exists, providerTextKey, expectedErrorMessage, mustFail) {
        it(t('anUser', 'pauseByAdminSwappingProvider', 'Should be able (or not) to pause a provider (by admin).', mustFail), async function() {
            //Setup
            const providerKey = toBytes32(providerTextKey);
            await stablePayStorage._registerSwappingProvider(
                genericSmartContract,
                providerKey,
                providerOwner,
                false,
                exists
            );

            //Invocation
            try {
                const result = await stablePayStorage.pauseByAdminSwappingProvider(providerKey, {from: pauseByAccount});

                // Assertions
                registerProvider
                    .swappingProviderPaused(result)
                    .emitted(stablePayStorage.address, genericSmartContract);
                
                const isPaused = await stablePayStorage.isSwappingProviderPaused(providerKey);

                assert(isPaused);
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