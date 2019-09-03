const withData = require('leche').withData;

const Bytes32ArrayMock = artifacts.require("./mock/util/Bytes32ArrayMock.sol");

const {
    title: t,
    toBytes32,
} = require('./consts');

contract('Bytes32ArrayLibTest', function (accounts) {
    
    beforeEach('Setup contract for each test', async () => {
    });

    withData({
        _1_found_atIndex0: [['1', '2'], '1', true, 0],
        _2_found_atLastIndex: [['3', '2'], '2', true, 1],
        _3_found_atMiddleIndex: [['3', 'r', 'a', '2'], 'a', true, 2],
        _4_notFound: [['1', '2'], '3', false, 2],
        _5_notFound_empty: [[], '1', false, 0]
    }, function(array, itemToFind, expectedFound, expectedIndex) {
        it(t('anUser', 'getIndex', 'Should be able to get the item index in the array.', false), async function() {
            // Setup
            const instance = await Bytes32ArrayMock.new(array.map(item=>toBytes32(item)));

            // Invocation
            const result = await instance.getIndex(toBytes32(itemToFind));
            
            // Assertions
            const {
                found,
                indexAt
            } = result;
            assert.equal(found.toString(), expectedFound.toString());
            assert.equal(indexAt.toString(), expectedIndex.toString());
        });
    });

    withData({
        _1_found_atIndex0: [['1', '2'], '1', 1],
        _2_found_atLastIndex: [['1', '2'], '2', 1],
        _3_found_atMiddleIndex: [['1', '3', '4', '2'], '4', 3],
        _4_notFound: [['11', '44'], '10', 2],
        _5_empty: [[], '10', 0]
    }, function(array, itemToRemove, expectedLength) {
        it(t('anUser', 'remove', 'Should be able to remove an item in the array.', false), async function() {
            // Setup
            const instance = await Bytes32ArrayMock.new(array.map(item=>toBytes32(item)));
            const itemToFindBytes32 = toBytes32(itemToRemove);
            
            // Invocation
            await instance.remove(itemToFindBytes32);
            
            // Assertions
            const result = await instance.getData();
            assert(!result.includes(itemToFindBytes32));
            assert.equal(result.length.toString(), expectedLength.toString());
        });
    });

    withData({
        _1_found_atIndex0: [['1', '2'], '13', 3],
        _2_found_atMiddleIndex: [['1', '3', '4', '2'], '14', 5],
        _3_empty: [[], '10', 1]
    }, function(array, itemToAdd, expectedLength) {
        it(t('anUser', 'add', 'Should be able add a new item.', false), async function() {
            // Setup
            const instance = await Bytes32ArrayMock.new(array.map(item=>toBytes32(item)));
            const itemToAddBytes32 = toBytes32(itemToAdd);
            
            // Invocation
            await instance.add(itemToAddBytes32);
            
            // Assertions
            const result = await instance.getData();
            assert(result.includes(itemToAddBytes32));
            assert.equal(result.length.toString(), expectedLength.toString());
        });
    });
});