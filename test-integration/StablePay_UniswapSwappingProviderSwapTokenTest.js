//
const exchange = artifacts.require("./uniswap/UniswapExchangeInterface.sol");
const factory = artifacts.require("./uniswap/UniswapFactoryInterface.sol");
const { BigNumber } = require('bignumber.js');
const { getBalances, printBalance } = require('../test/util/payUtil');

const StablePay = artifacts.require("./StablePay.sol");
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
    let stablePay;
    let stablePayStorage;

    const DECIMALS = (new BigNumber(10)).pow(18);
    const supply =  (new BigNumber(10).pow(10)).times(DECIMALS).toFixed();
    const approved = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();
    const initialLiquidity = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();

    const min = (new BigNumber(10).pow(2)).times(DECIMALS).toFixed();

    beforeEach('Deploying contract for each test', async () => {

        settings = await Settings.deployed();
        assert(settings);
        assert(settings.address);

        vault = await Vault.deployed();
        assert(vault);
        assert(vault.address);
        stablePay = await StablePay.deployed();
        assert(stablePay);
        assert(stablePay.address);

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

        const current_block = await web3.eth.getBlock(await web3.eth.getBlockNumber());

        await sourceErc20Exchange.addLiquidity(initialLiquidity, initialLiquidity, current_block.timestamp + 300, {value:100000000000000});
        await targetErc20Exchange.addLiquidity(initialLiquidity, initialLiquidity, current_block.timestamp + 300, {value:100000000000000});

        console.log('getEthToTokenOutputPrice =>>>', await sourceErc20Exchange.getEthToTokenOutputPrice(1000000000));

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
                amount: BigNumber(1).times((new BigNumber(10)).pow(18)).toFixed()
            };
            const targetToken = {
                name: 'OMG',
                instance: targetErc20,
                amount: BigNumber(1).times((new BigNumber(10)).pow(18)).toFixed()
            };

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, sourceToken.amount, {from: owner});

            const availability = await settings.getTokenAvailability(targetErc20.address);
            console.log('availability', availability);

            const vaultInitial = await getBalances(vault.address, sourceToken, targetToken);
            const customerAddressInitial = await getBalances(customerAddress, sourceToken, targetToken);
            const merchantAddressInitial = await getBalances(merchantAddress, sourceToken, targetToken);
            const uniswapProviderAddressInitial = await getBalances(uniswapProvider.address, sourceToken, targetToken);
            const stablePayAddressInitial = await getBalances(stablePay.address, sourceToken, targetToken);


            //targetToken.amount = BigNumber(targetToken.amount).times((new BigNumber(10)).pow(18)).toFixed();

            console.log(`-${sourceToken.name} => ${targetToken.amount} ${targetToken.name}.`);

            await sourceErc20.approve(
                stablePay.address,
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
                sourceAmount: targetToken.amount,
                merchantAddress: merchantAddress
            }).createOrder();
            console.log('orderArray', orderArray);

            //Invocation
            const result = await stablePay.payWithToken(orderArray, [uniswapProviderKey], {
                from: customerAddress,
                gas: 5000000
            });

            // Assertions
            assert(result);



            console.log('orderArray', orderArray);



        });
    });
});