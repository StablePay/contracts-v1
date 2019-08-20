const {
    title: t,
    ETH_ADDRESS,
} = require('../util/consts');
const withData = require('leche').withData;

// Mock Smart Contracts
const Mock = artifacts.require("./mock/Mock.sol");
const KyberSwappingProviderMock = artifacts.require("./mock/provider/KyberSwappingProviderMock.sol");
const StandardTokenMock = artifacts.require("./mock/erc20/StandardTokenMock.sol");

contract('KyberSwappingProviderTest', accounts => {
    const owner = accounts[0];

    let token;
    beforeEach('Setup', async () => {
        token = await StandardTokenMock.new(owner, 1000 * 100000*18);
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
            const stablePayMock = await Mock.new();
            const proxyMock = await Mock.new();
            const addressFeeMock = await Mock.new();
            const swappingProvider  = await KyberSwappingProviderMock.new(
                stablePayMock.address,
                proxyMock.address,
                addressFeeMock.address
            );

            //Invocation
            const result = await swappingProvider._isSupportedRate(minRate, maxRate);
                
            // Assertions
            assert.equal(result.toString(), isSupportedRateExpected.toString());
        });
    });

    withData({
        _1_1_ether: [1, ETH_ADDRESS, 18],
        _2_1_token_10_decimals: [1, undefined, 10],
        _3_21_token_12_decimals: [21, undefined, 12],
        _4_321_token_1_decimals: [321, undefined, 1],
        _5_32_token_0_decimals: [32, undefined, 0],
    }, function(amount, tokenAddress, decimals) {
        it(t('anUser', '_multiplyByDecimals', 'Should be able to get tokens amount multiplied by token decimals.', false), async function() {
            //Setup
            const tokenAmountExpected = amount*(10**decimals);
            const mock = await Mock.new();
            const swappingProvider  = await KyberSwappingProviderMock.new(
                mock.address,
                mock.address,
                mock.address
            );
            const decimalsEncodeAbi = token.contract.methods.decimals().encodeABI();
            const tokenMock = await Mock.new();
            const address = tokenAddress === undefined ? tokenMock.address : tokenAddress;
            await tokenMock.givenMethodReturnUint(decimalsEncodeAbi, decimals);

            //Invocation
            const result = await swappingProvider._multiplyByDecimals(address, amount.toString());
                
            // Assertions
            assert.equal(result.toString(), tokenAmountExpected.toString());
        });
    });
});