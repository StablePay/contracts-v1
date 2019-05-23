//
const exchange = artifacts.require("./uniswap/UniswapExchangeInterface.sol");
const factory = artifacts.require("./uniswap/UniswapFactoryInterface.sol");
const { BigNumber } = require('bignumber.js');
const { getBalances, printBalance } = require('../test/util/payUtil');

const IStablePay = artifacts.require("./interface/IStablePay.sol");
const StablePayProxy = artifacts.require("./StablePay.sol");
const Settings = artifacts.require("./base/Settings.sol");
const Vault = artifacts.require("./base/Vault.sol");
const StablePayStorage = artifacts.require("./base/StablePayStorage.sol");

const UniswapSwappingProvider = artifacts.require("./providers/UniswapSwappingProvider.sol");
const Token1 = artifacts.require("./erc20/EIP20.sol");
const Token2 = artifacts.require("./erc20/EIP20.sol");

const UniswapOrderFactory = require('../test/factories/UniswapOrderFactory');

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';

const contracts = require('../build/contracts.json');
const providersMap = new Map();
for (const key in contracts.data) {
    if (contracts.data.hasOwnProperty(key)) {
        const element = contracts.data[key];
        providersMap.set(element.key, element.value);
    }
}
function toDecimal(value) {
    return new BigNumber(value).toFixed();
}
contract('StablePay_UniswapSwappingProviderSwapTokenTest', (accounts) => {

    let owner = accounts[0];

    let customerAddress = accounts[1];
    let merchantAddress = accounts[2];


    let uniswapProvider;
    let uniswapFactory;


    let sourceErc20;
    let targetErc20 ;

    let vault;
    let settings;
    let istablePay;
    let stablePayStorage;
    let proxy;

    const DECIMALS = (new BigNumber(10)).pow(18);
    const supply =  (new BigNumber(10).pow(10)).times(DECIMALS).toFixed();
    const approved = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();
    const initialLiquidity = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();

    const min = (new BigNumber(10).pow(2)).times(DECIMALS).toFixed();
    const onetoken = (new BigNumber(1)).times(DECIMALS);
    const twotokens = (new BigNumber(2)).times(DECIMALS);
    const alice = accounts[2];
    const bob = accounts[3];
    const halftoken = (new BigNumber(0.5)).times(DECIMALS);
    const quartertoken = (new BigNumber(0.25)).times(DECIMALS);
    const _dot10token = (new BigNumber(0.10)).times(DECIMALS);
    const zero = (new BigNumber(0.0));
    const initialETH = new BigNumber(web3.utils.toWei('0.0001', 'ether'));
    let targetErc20Exchange;
    beforeEach('Deploying contract for each test', async () => {

        settings = await Settings.deployed();
        assert(settings);
        assert(settings.address);

        vault = await Vault.deployed();
        assert(vault);
        assert(vault.address);

        proxy = await StablePayProxy.deployed();
        assert(proxy);
        assert(proxy.address);

        istablePay = await IStablePay.at(proxy.address);
        assert(istablePay);
        assert(istablePay.address);

        stablePayStorage = await StablePayStorage.deployed();
        assert(stablePayStorage);
        assert(stablePayStorage.address);

        uniswapProvider = await UniswapSwappingProvider.deployed();
        assert(uniswapProvider);
        assert(uniswapProvider.address);

        const fact = await uniswapProvider.uniswapFactory.call();
        uniswapFactory = await factory.at(fact);

        sourceErc20 = await Token1.new(supply, "KNC", 18, "KNC");
        assert(sourceErc20);
        assert(sourceErc20.address);

        targetErc20 =  await Token2.new(supply, "OMG", 18, "OMG");
        assert(targetErc20);
        assert(targetErc20.address);


        await uniswapFactory.createExchange(sourceErc20.address);
        await uniswapFactory.createExchange(targetErc20.address);


        let sourceErc20ExchangeAddress = await uniswapFactory.getExchange(sourceErc20.address);
        let sourceErc20Exchange = await exchange.at(sourceErc20ExchangeAddress);
        await sourceErc20.approve(sourceErc20ExchangeAddress, approved);

        let targetErc20ExchangeAddress = await uniswapFactory.getExchange(targetErc20.address);
        targetErc20Exchange = await exchange.at(targetErc20ExchangeAddress);
        await targetErc20.approve(targetErc20ExchangeAddress, approved);


        const deadLine = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp + 300;
        await sourceErc20Exchange.addLiquidity(1, twotokens, deadLine, {value: web3.utils.toWei('1', 'ether')});
        await targetErc20Exchange.addLiquidity(1, twotokens, deadLine, {value: web3.utils.toWei('1', 'ether')});


        await settings.setTokenAvailability(sourceErc20.address, 100, supply, {from: owner});
        await settings.setTokenAvailability(targetErc20.address, 100, supply, {from: owner});

    });


    withData({
        _1_quartertoken: [quartertoken, zero, zero],
        _2_quartertoken: [quartertoken, zero, initialETH],
        _3_quartertoken: [quartertoken, _dot10token, initialETH],
        _4_halftoken: [halftoken, zero, zero],
        _5_halftoken: [halftoken, zero, initialETH],
        _6_halftoken: [halftoken, _dot10token, initialETH],
        _7_onetoken: [onetoken, zero, zero]
    }, function(targetAmount, extraETH, currentStablepayBalance) {
        it(t('anUser', 'swapToken', 'Should be able to swap any token.'), async function() {
            // Setup
            const sourceToken = {
                name: 'KNC',
                instance: sourceErc20,
                amount: 0
            };
            const targetToken = {
                name: 'OMG',
                instance: targetErc20,
                amount: targetAmount
            };

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, twotokens, {from: owner});
            if(currentStablepayBalance.gt(0)) {
                await web3.eth.sendTransaction({from: owner, to: uniswapProvider.address, value: currentStablepayBalance});
            }

            const initialMerchantBalance = new BigNumber(await targetToken.instance.balanceOf(merchantAddress));
            const initialCustomerBalance = new BigNumber(await sourceToken.instance.balanceOf(customerAddress));
            const initialCustomerBalanceETH = new BigNumber(await web3.eth.getBalance(customerAddress));
            const initialStablePayBalanceETH = new BigNumber(await web3.eth.getBalance(uniswapProvider.address));

           // const costs = await uniswapProvider.getExpectedRate.call(targetErc20.address, targetErc20.address, quartertoken);

            const rates = await targetErc20Exchange.getEthToTokenOutputPrice.call(targetToken.amount);

            const ethToBuyTargetToken = toDecimal(rates);

            const uniswapProviderKey = providersMap.get('Uniswap_v1');

            const ethToSend = BigNumber.sum(ethToBuyTargetToken, extraETH);

            const orderArray = new UniswapOrderFactory({
                sourceToken: NULL_ADDRESS,
                targetToken: targetToken.instance.address,
                sourceAmount: 0,
                targetAmount: targetToken.amount,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            }).createOrder();
            const platformFee= new BigNumber(await settings.getPlatformFee()).div(10000);

            const providerInitialTargetBalance = new BigNumber(await targetToken.instance.balanceOf(uniswapProvider.address));
            const providerInitialSourceBalance = new BigNumber(await sourceToken.instance.balanceOf(uniswapProvider.address));

            //Invocation
            const result = await istablePay.payWithEther(orderArray, [uniswapProviderKey], {
                from: customerAddress,
                value: ethToSend,
                gas: 5000000,
                gasPrice: 0
            });



            const finalistablePayTargetBalance = new BigNumber(await targetToken.instance.balanceOf(vault.address));

            const finalTargetBalance = new BigNumber(await targetToken.instance.balanceOf(merchantAddress));
            const sum = finalistablePayTargetBalance.plus(finalTargetBalance);

            const finalMerchantBalance = new BigNumber(await targetToken.instance.balanceOf(merchantAddress));
            const finalCustomerBalance = new BigNumber(await sourceToken.instance.balanceOf(customerAddress));

            const merchantDiff = finalMerchantBalance.minus(initialMerchantBalance);
            const customerDiff = initialCustomerBalance.minus(finalCustomerBalance);
            const feeAmount = targetToken.amount.times(platformFee);
            const finalTargetAmount = targetToken.amount.minus(feeAmount);



            // Assertions
            assert(sum.isEqualTo( targetToken.amount));
            assert(merchantDiff.isEqualTo( finalTargetAmount));


            const providerFinalTargetBalance = new BigNumber(await targetToken.instance.balanceOf(uniswapProvider.address));
            const providerFinalSourceBalance = new BigNumber(await sourceToken.instance.balanceOf(uniswapProvider.address));


            assert(providerInitialTargetBalance.isEqualTo( providerFinalTargetBalance));
            assert(providerInitialSourceBalance.isEqualTo( providerFinalSourceBalance));

            const finalCustomerBalanceETH = new BigNumber(await web3.eth.getBalance(customerAddress));
            const finalStablePayBalanceETH = new BigNumber(await web3.eth.getBalance(uniswapProvider.address));

            const customerDiffETH = initialCustomerBalanceETH.minus(ethToBuyTargetToken);

            assert(finalCustomerBalanceETH.isEqualTo( customerDiffETH));
            assert(initialStablePayBalanceETH.isEqualTo( finalStablePayBalanceETH));






        });
    });
});