const withData = require('leche').withData;

// Smart Contracts
const CustomUniswapExchangeMock = artifacts.require("./mock/CustomUniswapExchangeMock.sol");
const CustomUniswapFactoryMock = artifacts.require("./mock/CustomUniswapFactoryMock.sol");
const UniswapSwappingProvider = artifacts.require("./UniswapSwappingProvider.sol");
const StablePay = artifacts.require("./StablePay.sol");
const Token1 = artifacts.require("./services/erc20/EIP20.sol");
const Token2 = artifacts.require("./services/erc20/EIP20.sol");

// Utils
const {
    title:t
} = require('../util/consts');
const supply =  10000;

contract('UniswapSwappingProviderGetExpectedRateTest', accounts => {
    const owner = accounts[0];
    let account1 = accounts[1];
    let account2 = accounts[2];
    let tokenAddress =  accounts[2];



    beforeEach('beforeEach', async () => {
        stablePay = await StablePay.deployed();
        assert(stablePay);
        assert(stablePay.address);

        const token1 = await Token1.new(supply, "a", 18, "A");
        tokenAddress = token1.address;


    });
/*
    withData({
            _1_withInvalidExchangeAddress: [tokenAddress, tokenAddress, "0x0000000000000000000000000000000000000000", account2, "1", false, "0", "0"],
            _2_withUndefinedExchangeAddress: [tokenAddress, tokenAddress, undefined, account2, "1", true, "1", "1"]
    }, function(sourceToken, targetToken, exchangeAddress, tokenAddress, value, isSupportedExpected, minRateExpected, maxRateExpected) {
        it(t('anUser', 'getExpectedRate', 'Should be able to get the expected rate.', false), async function() {
            //Setup
            const valueWei = web3.utils.toWei(value, 'ether');
            const exchange = await CustomUniswapExchangeMock.new(valueWei, valueWei, valueWei, valueWei, tokenAddress);
            const finalExchangeAddress = exchangeAddress === undefined ? exchange.address : exchangeAddress;
            const uniswapFactory = await CustomUniswapFactoryMock.new(finalExchangeAddress, tokenAddress);
            const factoryAddress = uniswapFactory.address;
            const uniswapProvider = await UniswapSwappingProvider.new(stablePay.address, factoryAddress);

            //Invocation
            const expectedRateResult = await uniswapProvider.getExpectedRate(
                sourceToken,
                targetToken,
                "1"
            );

            // Assertions
            assert.equal(expectedRateResult.isSupported, isSupportedExpected);
            assert.equal(expectedRateResult.minRate, web3.utils.toWei(minRateExpected, 'ether'));
            assert.equal(expectedRateResult.maxRate, web3.utils.toWei(maxRateExpected, 'ether'));
        });
    });
*/
});
