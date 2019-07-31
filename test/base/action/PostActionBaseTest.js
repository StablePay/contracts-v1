const PostActionBaseMock = artifacts.require("./mock/action/PostActionBaseMock.sol");
const Storage = artifacts.require("./base/Storage.sol");
const StablePay = artifacts.require("./StablePay.sol");

const { NULL_ADDRESS } = require('../../util/consts');
const withData = require('leche').withData;
const t = require('../../util/consts').title;

contract('PostActionBaseTest', function (accounts) {

    const account0 = accounts[0];

    let storage;

    beforeEach('Setup contract for each test', async () => {
        storage = await Storage.deployed();
        assert(storage);
        assert(storage.address);
    });

    withData({
        _1_withStablePay: [StablePay.address, undefined, false],
        _2_withAccount0: [account0, 'Address must be StablePay', true]
    }, function(address, errorExpected, mustFail) {
        it(t('anUser', 'isStablePay', 'Should be able (or not) to test whether address is StablePay or not.', mustFail), async function() {
            //Setup
            const postActionInstance = await PostActionBaseMock.new(storage.address);

            try {
                // Invocation
                const result = await postActionInstance._isStablePay(address);
                console.log(result);

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);

            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes(errorExpected));
            }
        });
    });

    withData({
        _1_basic: [StablePay.address],
    }, function(address) {
        it(t('anUser', '_getStablePayAddress', 'Should be able to get StablePay address.', false), async function() {
            //Setup
            const postActionInstance = await PostActionBaseMock.new(storage.address);

            // Invocation
            const result = await postActionInstance._getStablePayAddress();
            console.log(result);
            // Assertions
            assert(result);
            assert.equal(result.toString(), address.toString());
        });
    });    
});