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
    const supply =  (new BigNumber(10).pow(10)).times(DECIMALS).toFixed();
    const approved = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();
    const initialLiquidity = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();

    const min = (new BigNumber(10).pow(2)).times(DECIMALS).toFixed();
    const onetoken = (new BigNumber(1)).times(DECIMALS).toFixed();
    const twotokens = (new BigNumber(2)).times(DECIMALS).toFixed();
    const alice = accounts[2];
    const bob = accounts[3];
    const halftoken = (new BigNumber(0.5)).times(DECIMALS).toFixed();
    const quartertoken = (new BigNumber(0.25)).times(DECIMALS).toFixed();

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


        const deadLine = (await web3.eth.getBlock(await web3.eth.getBlockNumber())).timestamp + 300;
        await sourceErc20Exchange.addLiquidity(1, twotokens, deadLine, {value: web3.utils.toWei('1', 'ether')});
        await targetErc20Exchange.addLiquidity(1, twotokens, deadLine, {value: web3.utils.toWei('1', 'ether')});



        const platformFeeString = await settings.getPlatformFee();
        const platformFee = Number(platformFeeString.toString()) / 100;

        await settings.setTokenAvailability(sourceErc20.address, 100, supply, {from: owner});
        await settings.setTokenAvailability(targetErc20.address, 100, supply, {from: owner});

    });


    withData({
        _1_smallAmount: [10000000]
    }, function(unitsOfTokens) {
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
                amount: quartertoken
            };

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, onetoken, {from: owner});

            const availability = await settings.getTokenAvailability(targetErc20.address);


            const costs = await uniswapProvider.getExpectedRate.call(sourceErc20.address, targetErc20.address, quartertoken);
            const ethToBuyTargetToken = toDecimal(costs[1])
            const sourceTokensTosell = toDecimal(costs[2]);

            console.log('result =>>>', (costs[0]));
            console.log('ethToBuyTargetToken =>>>', ethToBuyTargetToken);
            console.log('sourceTokensTosell =>>>', sourceTokensTosell);

            sourceToken.amount = sourceTokensTosell;
            await sourceErc20.approve(
                istablePay.address,
                sourceToken.amount,
                {from: customerAddress}
            );

            console.log('Source Amount');
            console.log(sourceToken.amount);
            console.log('Target Amount');
            console.log(targetToken.amount);

            const uniswapProviderKey = providersMap.get('Uniswap_v1');

            const orderArray = new UniswapOrderFactory({
                sourceToken: sourceToken.instance.address,
                targetToken: targetToken.instance.address,
                sourceAmount: sourceToken.amount,
                targetAmount: targetToken.amount,
                merchantAddress: merchantAddress
            }).createOrder();
            console.log('orderArray', orderArray);

            const initialTargetBalance = new BigNumber(await targetToken.instance.balanceOf(merchantAddress)).toFixed();
            console.log('initialTargetBalance=>>>', initialTargetBalance);

            //Invocation
            const result = await istablePay.payWithToken(orderArray, [uniswapProviderKey], {
                from: customerAddress,
                gas: 5000000
            });

            // Assertions

            const finalTargetBalance = new BigNumber(await targetToken.instance.balanceOf(merchantAddress)).toFixed();
            console.log('finalTargetBalance=>>>', finalTargetBalance);





        });
    });
});