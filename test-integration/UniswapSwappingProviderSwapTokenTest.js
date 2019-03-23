//
const exchange = artifacts.require("./uniswap/UniswapExchangeInterface.sol");
const factory = artifacts.require("./uniswap/UniswapFactoryInterface.sol");
const { BigNumber } = require('bignumber.js');


const UniswapSwappingProvider = artifacts.require("./providers/UniswapSwappingProvider.sol");
const Token1 = artifacts.require("./erc20/EIP20.sol");
const Token2 = artifacts.require("./erc20/EIP20.sol");

const UniswapOrderFactory = require('../test/factories/UniswapOrderFactory');

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;
const { printBalanceOf } = require('../test/util/payUtil');

contract('UniswapSwappingProviderSwapTokenTest', (accounts) => {

    let owner = accounts[0];

    let customerAddress = accounts[1];
    let merchantAddress = accounts[2];


    let uniswapProvider;
    let uniswapFactory;


    let sourceErc20;
    let targetErc20 ;

    const DECIMALS = (new BigNumber(10)).pow(18);
    const supply =  (new BigNumber(10).pow(10)).times(DECIMALS).toFixed();
    const approved = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();
    const initialLiquidity = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();

    beforeEach('Deploying contract for each test', async () => {

        uniswapProvider = await UniswapSwappingProvider.deployed();
        assert(uniswapProvider);
        assert(uniswapProvider.address);

        const fact = await uniswapProvider.uniswapFactory.call();
        console.log('fact -> ' + fact);
        uniswapFactory = await factory.at(fact);

        sourceErc20 = await Token1.new(supply, "KNC", 18, "KNC");
        assert(sourceErc20);
        assert(sourceErc20.address);

        targetErc20 =  await Token2.new(supply, "OMG", 18, "OMG");
        assert(targetErc20);
        assert(targetErc20.address);

        console.log('template address', await uniswapFactory.exchangeTemplate.call());

        await uniswapFactory.createExchange(sourceErc20.address);
        await uniswapFactory.createExchange(targetErc20.address);
        assert.equal(await uniswapFactory.tokenCount(), 2);


        let sourceErc20ExchangeAddress = await uniswapFactory.getExchange(sourceErc20.address);
        let sourceErc20Exchange = await exchange.at(sourceErc20ExchangeAddress);
        await sourceErc20.approve(sourceErc20ExchangeAddress, approved);

        let targetErc20ExchangeAddress = await uniswapFactory.getExchange(targetErc20.address);
        let targetErc20Exchange = await exchange.at(targetErc20ExchangeAddress);
        await targetErc20.approve(targetErc20ExchangeAddress, approved);

        const current_block = await web3.eth.getBlock(await web3.eth.getBlockNumber());

        await sourceErc20Exchange.addLiquidity(initialLiquidity, initialLiquidity, current_block.timestamp + 300, {value:100000000000000});
        await targetErc20Exchange.addLiquidity(initialLiquidity, initialLiquidity, current_block.timestamp + 300, {value:100000000000000});

        console.log('getEthToTokenOutputPrice =>>>', await sourceErc20Exchange.getEthToTokenOutputPrice(1000000000));
    });


    withData({
        _1_smallAmount: [10000000]
    }, function(unitsOfTokens) {
        it(t('anUser', 'swapToken', 'Should be able to swap any token.'), async function() {
            // Setup
            const sourceToken = {
                name: 'KNC',
                instance: sourceErc20,
                amountWei: 10000000
            };
            const targetToken = {
                name: 'OMG',
                instance: targetErc20,
                amountWei: 10000000
            };

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, sourceToken.amountWei, {from: owner});

            const initialCustomerSourceBalance = await sourceErc20.balanceOf(customerAddress);
            assert(new BigNumber(initialCustomerSourceBalance).toNumber() > 0);
            const initialCustomerTargetBalance = await targetErc20.balanceOf(customerAddress);

            const initialMerchantSourceBalance = await sourceErc20.balanceOf(merchantAddress);
            const initialMerchantTargetBalance = await targetErc20.balanceOf(merchantAddress);

            //
            await sourceErc20.transfer(
                uniswapProvider.address,
                sourceToken.amountWei,
                {from: customerAddress}
            );


            const initialSwappingProviderSourceBalance = await sourceErc20.balanceOf(uniswapProvider.address);
            assert.equal(initialSwappingProviderSourceBalance, sourceToken.amountWei);

            const orderArray = new UniswapOrderFactory({
                sourceToken: sourceToken.instance.address,
                targetToken: targetToken.instance.address,
                sourceAmount: targetToken.amountWei,
                merchantAddress: merchantAddress
            }).createOrder();

            console.log('orderArray', orderArray);

            //Invocation
           /* const _uniswapProvider = ContractWrapperByAccount(
                uniswapProvider.abi,
                uniswapProvider.address,
                providerEngine,
                customerAddress
            );*/


            //console.log('before testGetExpectedRateResult');
            //const proxyResult = await _uniswapProvider.proxy();
            //console.log(proxyResult);
            //console.log('_kyberProvider.proxy', `"${proxyResult}"`);

            // assert.equal(proxyResult, kyberProxy.address);
            // assert(proxyResult === kyberProxy.address);

            //console.log('kyberProxy.address', `"${kyberProxy.address}"`);
            const er = await uniswapProvider.getExpectedRate(
                sourceToken.instance.address,
                targetToken.instance.address,
                targetToken.amountWei
            );

            /*const testGetExpectedRateResult = await uniswapProvider.getExpectedRate(
                targetToken.amountWei,
                sourceToken.instance.address,
                targetToken.instance.address
            );
            console.log('expectedRate   ', testGetExpectedRateResult[0].toString());
            console.log('slippageRate   ', testGetExpectedRateResult[1].toString());
            assert(testGetExpectedRateResult);*/

            const result = await uniswapProvider.swapToken(orderArray);

//            console.log(result);
            //         assert(false);

            // Assertions
            assert(result);

            const finalCustomerSourceBalance = await sourceErc20.balanceOf(customerAddress);
            const finalCustomerTargetBalance = await targetErc20.balanceOf(customerAddress);

            const finalMerchantSourceBalance = await sourceErc20.balanceOf(merchantAddress);
            const finalMerchantTargetBalance = await targetErc20.balanceOf(merchantAddress);

            printBalanceOf('Customer', 'SOURCE', initialCustomerSourceBalance, finalCustomerSourceBalance);
            printBalanceOf('Customer', 'TARGET', initialCustomerTargetBalance, finalCustomerTargetBalance);

            printBalanceOf('Merchant', 'SOURCE', initialMerchantSourceBalance, finalMerchantSourceBalance);
            printBalanceOf('Merchant', 'TARGET', initialMerchantTargetBalance, finalMerchantTargetBalance);
        });
    });
});