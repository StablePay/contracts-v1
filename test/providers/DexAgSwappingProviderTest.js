const {
    title: t,
    ETH_ADDRESS,
} = require('../util/consts');
const withData = require('leche').withData;

// Mock Smart Contracts 
const Mock = artifacts.require("./mock/Mock.sol");
//const DexAgSwappingProviderMock = artifacts.require("./mock/provider/DexAgSwappingProviderMock.sol");
const SimpleToken = artifacts.require("./mock/token/SimpleToken.sol");
//const StandardTokenMock = artifacts.require("./mock/erc20/StandardTokenMock.sol");

contract('DexAgSwappingProviderTest', accounts => {
    const owner = accounts[0];

    let token;
    beforeEach('Setup', async () => {
        token = await SimpleToken.new({from: owner});
    });

    withData({
        _1_min_0_max_0_notSupported: ['0', '0', false],
        _2_min_1_max_0_notSupported: ['1', '0', false],
        _3_min_0_max_1_notSupported: ['0', '1', false],
        _4_min_1_max_1_supported: ['1', '1', true],
        _5_min_12_max_2_supported: ['12', '2', true],
    }, function(minRate, maxRate, isSupportedRateExpected) {
        it(t('anUser', '_isSupportedRate', 'Should be able to test whether rate is supported or not.', false), async function() {
            //Setup
            
        });
    });
});