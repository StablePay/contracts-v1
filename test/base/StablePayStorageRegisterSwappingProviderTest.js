const withData = require('leche').withData;

// Smart Contracts
const StablePayStorageMock = artifacts.require("./StablePayStorageMock.sol");
const Storage = artifacts.require("./Storage.sol");

// Utils
const util = require('ethereumjs-util');
const t = require('../util/TestUtil').title;
const registerProvider  = require('../util/events').registryProvider;

contract('StablePayStorageRegisterSwappingProviderTest', accounts => {
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
        _1_valid: [account2, account1, '_6textToBytes1', undefined, false],
        _2_invalidProviderAddress: ['0x0', account1, '_6textToBytes2', 'invalid address', true],
        _3_nullProviderAddress: ['', account1, '_6textToBytes3', 'invalid address', true]
    }, function(providerAddress, providerOwner, providerTextKey, expectedErrorMessage, mustFail) {
        it(t('anUser', 'registerSwappingProvider', 'Should be able (or not) to register a provider.', mustFail), async function() {
            //Setup
            const providerKey = util.bufferToHex(util.setLengthRight(providerTextKey, 32));
            
            //Invocation
            try {
                const result = await stablePayStorage.registerSwappingProvider(
                    providerAddress,
                    providerKey,
                    {from: providerOwner}
                );

                // Assertions
                registerProvider
                    .newSwappingProviderRegistered(result)
                    .emitted(stablePayStorage.address, providerKey, providerAddress, providerOwner);

                const providerDataResult = await stablePayStorage.getSwappingProvider(providerKey);
                const providersCountResult = await stablePayStorage.getProvidersRegistryCount();

                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(providerDataResult);

                assert.equal(providerDataResult.providerAddress, providerAddress);
                assert.equal(providerDataResult.ownerAddress, providerOwner);
                assert.equal(providerDataResult.pausedByOwner, false);
                assert.equal(providerDataResult.pausedByAdmin, false);
                assert.equal(providerDataResult.exists, true);
                assert.equal(providersCountResult, 1);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.reason.includes(expectedErrorMessage));
            }
        });
    });
});