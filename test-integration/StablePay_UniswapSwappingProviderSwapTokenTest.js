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
    const supply =  (new BigNumber(109).pow(64)).times(DECIMALS).toFixed();
    const twotokens = (new BigNumber(2)).times(DECIMALS).toFixed();
    const hundredTokens = (new BigNumber(100)).times(DECIMALS);
    const halftoken = (new BigNumber(0.5)).times(DECIMALS);
    const quartertoken = (new BigNumber(0.25)).times(DECIMALS);
    const _dot10token = (new BigNumber(0.10)).times(DECIMALS);
    const zero = (new BigNumber(0.0));
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
        await sourceErc20.approve(sourceErc20ExchangeAddress, supply);

        let targetErc20ExchangeAddress = await uniswapFactory.getExchange(targetErc20.address);
        let targetErc20Exchange = await exchange.at(targetErc20ExchangeAddress);
        await targetErc20.approve(targetErc20ExchangeAddress, supply);


        const deadLine = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp + 300;
        await sourceErc20Exchange.addLiquidity(1, hundredTokens, deadLine, {value: web3.utils.toWei('0.1', 'ether')});
        await targetErc20Exchange.addLiquidity(1, hundredTokens, deadLine, {value: web3.utils.toWei('0.1', 'ether')});

        await settings.setTokenAvailability(sourceErc20.address, 100, supply, {from: owner});
        await settings.setTokenAvailability(targetErc20.address, 100, supply, {from: owner});

    });


    withData({
         _10_QuarterToken_dot25: [quartertoken, zero, _dot10token],
         _20_QuarterToken_dot25: [quartertoken, zero, zero],
         _30_QuarterPlusExtraTokenAmount_dot10: [quartertoken, _dot10token, _dot10token],
         _40_exactTokenAmount_dot25: [(new BigNumber(0.2)).times(DECIMALS) , zero, zero],
         _50_exactTokenAmount_dot25: [halftoken, zero, _dot10token],
         _60_HalfTokenPlusExtraTokenAmount_dot10: [halftoken,_dot10token, quartertoken],
         _70_HalfTokenPlusExtraTokenAmount_dot10: [halftoken,_dot10token, zero],
    }, function(targetAmount, extraAmount, stablePayBalance) {
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

            if(stablePayBalance.gt(0)) {
                await sourceErc20.transfer(uniswapProvider.address, stablePayBalance, {from: owner});
                await targetErc20.transfer(uniswapProvider.address, stablePayBalance, {from: owner});
            }

            const providerInitialTargetBalance = new BigNumber(await targetToken.instance.balanceOf(uniswapProvider.address));
            const providerInitialSourceBalance = new BigNumber(await sourceToken.instance.balanceOf(uniswapProvider.address));

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, twotokens, {from: owner});

            const initialMerchantBalance = new BigNumber(await targetToken.instance.balanceOf(merchantAddress));
            const initialCustomerBalance = new BigNumber(await sourceToken.instance.balanceOf(customerAddress));

            const costs = await uniswapProvider.getExpectedRate.call(sourceErc20.address, targetErc20.address, targetAmount);
            const sourceTokensTosell = toDecimal(costs[1])
            const t = new BigNumber(costs[1]).div(DECIMALS);


            const tokensToSend = BigNumber.sum(costs[1], extraAmount);
            sourceToken.amount = tokensToSend;

            await sourceErc20.approve(
                istablePay.address,
                sourceToken.amount,
                {from: customerAddress}
            );

            const uniswapProviderKey = providersMap.get('Uniswap_v1');


            const orderArray = new UniswapOrderFactory({
                sourceToken: sourceToken.instance.address,
                targetToken: targetToken.instance.address,
                sourceAmount: sourceToken.amount,
                targetAmount: targetToken.amount,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            }).createOrder();

            const platformFee= new BigNumber(await settings.getPlatformFee()).div(10000);



            //Invocation
            const result = await istablePay.transferWithTokens(orderArray, [uniswapProviderKey], {
                from: customerAddress,
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
            assert(customerDiff.isEqualTo(sourceTokensTosell));

            const providerFinalTargetBalance = new BigNumber(await targetToken.instance.balanceOf(uniswapProvider.address));
            const providerFinalSourceBalance = new BigNumber(await sourceToken.instance.balanceOf(uniswapProvider.address));


            assert(providerInitialTargetBalance.isEqualTo( providerFinalTargetBalance));
            assert(providerInitialSourceBalance.isEqualTo( providerFinalSourceBalance));




        });
    });

    withData({
        _10_QuarterToken_dot25: [quartertoken, new BigNumber(20), zero ],

        _20_HalfTokenPlusExtraTokenAmount_dot10: [halftoken,new BigNumber(10), zero],
    }, function(targetAmount, minusAmount, stablePayBalance) {
        it(t('anUser', 'swapToken', 'Should not be able to swap any token due to not enough tokens'), async function() {
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

            if(stablePayBalance.gt(0)) {
                await sourceErc20.transfer(uniswapProvider.address, stablePayBalance, {from: owner});
                await targetErc20.transfer(uniswapProvider.address, stablePayBalance, {from: owner});
            }

            const providerInitialTargetBalance = new BigNumber(await targetToken.instance.balanceOf(uniswapProvider.address));
            const providerInitialSourceBalance = new BigNumber(await sourceToken.instance.balanceOf(uniswapProvider.address));

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, twotokens, {from: owner});

            const initialMerchantBalance = new BigNumber(await targetToken.instance.balanceOf(merchantAddress));
            const initialCustomerBalance = new BigNumber(await sourceToken.instance.balanceOf(customerAddress));

            const costs = await uniswapProvider.getExpectedRate.call(sourceErc20.address, targetErc20.address, targetAmount);
            const sourceTokensTosell = toDecimal(costs[1])
            const t = new BigNumber(costs[1]).div(DECIMALS);


            let  tokensToSend = new BigNumber(costs[1]);
            sourceToken.amount = tokensToSend;

            await sourceErc20.approve(
                istablePay.address,
                sourceToken.amount,
                {from: customerAddress}
            );

            tokensToSend = (new BigNumber(costs[1])).minus( minusAmount);
            sourceToken.amount = tokensToSend;

            const uniswapProviderKey = providersMap.get('Uniswap_v1');


            const orderArray = new UniswapOrderFactory({
                sourceToken: sourceToken.instance.address,
                targetToken: targetToken.instance.address,
                sourceAmount: sourceToken.amount,
                targetAmount: targetToken.amount,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            }).createOrder();

            const platformFee= new BigNumber(await settings.getPlatformFee()).div(10000);





            try {
                //Invocation
                const result = await istablePay.payWithToken(orderArray, [uniswapProviderKey], {
                    from: customerAddress,
                    gas: 5000000,
                    gasPrice: 0
                });
                assert(false, 'It should have failed');
            } catch (error) {
                assert(error);
                //assert(error.message.includes("revert"));
                //assert(error.message.includes("Source amount not enough for the swapping"))

            }



            const finalMerchantBalance = new BigNumber(await targetToken.instance.balanceOf(merchantAddress));
            const finalCustomerBalance = new BigNumber(await sourceToken.instance.balanceOf(customerAddress));


            assert(initialMerchantBalance.isEqualTo( finalMerchantBalance));
            assert(initialCustomerBalance.isEqualTo( finalCustomerBalance));

            // Assertions

            const providerFinalTargetBalance = new BigNumber(await targetToken.instance.balanceOf(uniswapProvider.address));
            const providerFinalSourceBalance = new BigNumber(await sourceToken.instance.balanceOf(uniswapProvider.address));


            assert(providerInitialTargetBalance.isEqualTo( providerFinalTargetBalance));
            assert(providerInitialSourceBalance.isEqualTo( providerFinalSourceBalance));



        });
    });
});