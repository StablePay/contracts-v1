const appConfig = require('../src/config');
const BigNumber = require('bignumber.js');
const UniswapSwappingProvider = artifacts.require("./providers/UniswapSwappingProvider.sol");
const Exchange = artifacts.require("./uniswap/UniswapExchangeInterface.sol");
const Factory = artifacts.require("./uniswap/UniswapFactoryInterface.sol");

const IStablePay = artifacts.require("./interface/IStablePay.sol");
const Settings = artifacts.require("./base/Settings.sol");
const Vault = artifacts.require("./base/Vault.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");
const Storage = artifacts.require("./base/StablePayStorage.sol");

const DECIMALS = (new BigNumber(10)).pow(18);
const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;
const Balances = require('../src/balances/Balances');
const Amount = require('../src/amounts/Amount');
const ProcessArgs = require('../src/utils/ProcessArgs');
const OrderDataBuilder = require('../src/builder/ByApiOrderDataBuilder');
const StablePayWrapper = require('../src/contracts/StablePayWrapper');
const processArgs = new ProcessArgs();
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const  ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
contract('StablePayTransferWithEthersPerApiTest-Uniswap', (accounts) => {
    const appConf = require('../config')(processArgs.network());
    const stablepayConf = appConf.stablepay;
    const stablepayContracts = stablepayConf.contracts;
    const stablepayProviders = stablepayConf.providers;
    const uniswapConf = appConf.uniswap;
    const uniswapContracts = uniswapConf.contracts;
    const uniswapTokens = uniswapConf.tokens;

    let vault;
    let settings;
    let stablePay;
    let balances;
    let uniswapProvider;
    let uniswapFactory;
    let storage;

    beforeEach('Deploying contract for each test', async () => {

        uniswapFactory = await Factory.at(uniswapContracts.factory);
        assert(uniswapFactory);
        assert(uniswapFactory.address);

        settings = await Settings.at(stablepayContracts.Settings);
        assert(settings);
        assert(settings.address);

        vault = await Vault.at(stablepayContracts.Vault);
        assert(vault);
        assert(vault.address);

        storage = await Storage.at(stablepayContracts.StablePayStorage);
        assert(storage);
        assert(storage.address);

        uniswapProvider = await UniswapSwappingProvider.at(stablepayContracts.UniswapSwappingProvider);
        assert(uniswapProvider);
        assert(uniswapProvider.address);

        stablePay = await IStablePay.at(stablepayContracts.StablePay);
        assert(stablePay);
        assert(stablePay.address);

        balances = new Balances();
        balances.addAccount('StablePay', stablePay.address);
        balances.addAccount('Vault', vault.address);
        balances.addAccount('UniswapProvider', uniswapProvider.address);
    });

    withData({
        _1_ETH_to_10_DAI: [0, 1, "ETH", "DAI", "11", true],
        _2_ETH_to_15_5_DAI: [0, 1, "ETH", "DAI", "15.5", true],

    }, function(customerIndex, merchantIndex, sourceTokenName, targetTokenName, targetTokenAmount, verbose) {
        it(t('anUser', 'transferWithEthers', `Should be able to transferWithEthers ${sourceTokenName} -> ${targetTokenAmount} ${targetTokenName}s.`), async function() {

            const target = {
                address: uniswapTokens[targetTokenName],
                amount: targetTokenAmount
            };
            const customerAddress = accounts[customerIndex];
            const merchantAddress = accounts[merchantIndex];

            const platformFee= new BigNumber(await settings.getPlatformFee()).div(10000);

            balances.addAccount('Customer', customerAddress);
            balances.addAccount('Merchant', merchantAddress);

            //const sourceTokenInstance = source;
            const targetTokenInstance = await ERC20.at(target.address);

            await balances.saveBalances('InitialBalances', [

                targetTokenInstance
            ]);

             const targetExchangeAddress = await uniswapFactory.getExchange(target.address);
             console.log('targetExchangeAddress', targetExchangeAddress);
             const exchangeInstance = await Exchange.at(targetExchangeAddress);
            console.log('exchangeInstance', exchangeInstance.address);

            const customerInitialBalance = await web3.eth.getBalance(customerAddress);
            console.log('customerAddress Initial    ', customerInitialBalance.toString());
            const url = appConfig.getOrderFactoryUrl().get();
            const stablePayWrapper = new StablePayWrapper(stablePay, new OrderDataBuilder(url, storage, uniswapProvider, exchangeInstance), null, verbose);

            // Invocation
            const data = {
                sourceAddress: ETH_ADDRESS,
                targetAmount: target.amount,
                targetAddress: target.address,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            };
            const result = await stablePayWrapper.transferWithEthers(data,
                {from: customerAddress, gas: 8000000});

            assert(result.success);
            const amounts = result.amounts;

            const vaultAmount = new Amount(
                Number(target.amount) * platformFee.toNumber() ,
                await targetTokenInstance.decimals()
            );
            
            await balances.saveBalances('FinalBalances', [

                targetTokenInstance
            ]);

            const resultBalances = balances.getBalances('FinalBalances', 'InitialBalances');
            console.log(resultBalances);

             const vaultTargetTokenBalance = resultBalances.getBalance('Vault', targetTokenInstance);

            console.log(vaultAmount);
            console.log(vaultAmount.asWeisFixed());
            console.log(vaultTargetTokenBalance);
            assert(vaultTargetTokenBalance.isMinusEquals(vaultAmount.asWeisFixed()));

            const stablePayTargetTokenBalance = resultBalances.getBalance('StablePay', targetTokenInstance);
            assert(stablePayTargetTokenBalance.isMinusEquals("0"));

            const kyberProviderTargetTokenBalance = resultBalances.getBalance('UniswapProvider', targetTokenInstance);
            assert(kyberProviderTargetTokenBalance.isMinusEquals("0"));

            const toAmount = new Amount(
                Number(target.amount) - vaultAmount.value,
                await targetTokenInstance.decimals()
            );
            const merchantTargetTokenBalance = resultBalances.getBalance('Merchant', targetTokenInstance);
            assert(merchantTargetTokenBalance.isMinusEquals(toAmount.asWeisFixed()));

            const customerTargetTokenBalance = resultBalances.getBalance('Customer', targetTokenInstance);

            const gasUsed = result.tx.gasUsed;
            console.log('gasUsed   ', gasUsed);
            const gasPrice = await web3.eth.getGasPrice();
            console.log('gasPrice   ', gasPrice);
            const txFee = gasPrice * gasUsed;
            console.log('txFee  ', txFee);


            const customerFinalBalance = await web3.eth.getBalance(customerAddress);
            console.log('customerAddress Final    ', customerFinalBalance.toString());
            console.log(amounts.min);
            console.log(amounts.max);
            console.log(customerTargetTokenBalance.minusString());

            assert(customerTargetTokenBalance.isMinusEquals("0"));
        });
    });
});