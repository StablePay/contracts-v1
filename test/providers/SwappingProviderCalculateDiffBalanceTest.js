const {
    title: t,
} = require('../util/consts');
const withData = require('leche').withData;

// Mock Smart Contracts
const CustomSwappingProviderMock = artifacts.require("./mock/CustomSwappingProviderMock.sol");

// Smart Contracts
const Storage = artifacts.require("./base/Storage.sol");

contract('ISwappingProviderCalculateDiffBalanceTest', accounts => {
    const account1 = accounts[1];

    beforeEach('Setup', async () => {
        const storageInstance = await Storage.deployed();
        assert(storageInstance);
        assert(storageInstance.address);
    });

    withData({
        _1_10_11: [account1, "0.5", "0.5", "0.1", "0.1", undefined, false],
        _2_10_11: [account1, "1", "1.5", "1", "0.5", undefined, false],
        _3_10_11: [account1, "1", "1.5", "0.5", "0", undefined, false],
        _4_10_11: [account1, "0.054919405772029547", "0.054919405772029547", "0.000274597028860148", "0.000274597028860148", undefined, false]
    }, function(owner, sentAmount, initialAmount, finalAmount, diffBalanceExpected, errorMessageExpected, mustFail) {
        it(t('anUser', '_calculateDiffBalance', 'Should be able (or not) to calculate the diff balance.', mustFail), async function() {
            //Setup
            const swappingProvider  = await CustomSwappingProviderMock.new(owner);

            const initialAmountWei = web3.utils.toWei(initialAmount, 'ether');
            const finalAmountWei = web3.utils.toWei(finalAmount, 'ether');
            const sentAmountWei = web3.utils.toWei(sentAmount, 'ether');

            try {
                //Invocation
                const result = await swappingProvider._calculateDiffBalance(sentAmountWei, initialAmountWei, finalAmountWei);
                
                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
                const diffBalanceExpectedWei = web3.utils.toWei(diffBalanceExpected, 'ether');

                assert.equal(result.toString(), diffBalanceExpectedWei.toString());                
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
            }
        });
    });
});