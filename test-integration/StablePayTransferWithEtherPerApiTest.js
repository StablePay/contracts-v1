const appConfig = require('../src/config');

const KyberSwappingProvider = artifacts.require("./providers/KyberSwappingProvider.sol");
const IStablePay = artifacts.require("./interface/IStablePay.sol");
const Settings = artifacts.require("./base/Settings.sol");
const Vault = artifacts.require("./base/Vault.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");

const leche = require('leche');
const withData = leche.withData;
const {
    title: t,
} = require('../test/util/consts');
const Balances = require('../src/balances/Balances');
const Amount = require('../src/amounts/Amount');
const ProcessArgs = require('../src/utils/ProcessArgs');
const OrderDataBuilder = require('../src/builder/ByApiOrderDataBuilder');
const StablePayWrapper = require('../src/contracts/StablePayWrapper');
const processArgs = new ProcessArgs();

contract('StablePayTransferWithEthersPerApiTest', (accounts) => {
    const appConf = require('../config')(processArgs.network());
    const maxGas = appConf.maxGas;
    const stablepayConf = appConf.stablepay;
    const stablepayContracts = stablepayConf.contracts;
    const kyberConf = appConf.kyber;
    const kyberTokens = kyberConf.tokens;

    let vault;
    let settings;
    let stablePay;
    let balances;

    beforeEach('Deploying contract for each test', async () => {
        settings = await Settings.at(stablepayContracts.Settings);
        assert(settings);
        assert(settings.address);

        vault = await Vault.at(stablepayContracts.Vault);
        assert(vault);
        assert(vault.address);

        kyberProvider = await KyberSwappingProvider.at(stablepayContracts.KyberSwappingProvider);
        assert(kyberProvider);
        assert(kyberProvider.address);

        stablePay = await IStablePay.at(stablepayContracts.StablePay);
        assert(stablePay);
        assert(stablePay.address);

        balances = new Balances();
        balances.addAccount('StablePay', stablePay.address);
        balances.addAccount('Vault', vault.address);
        balances.addAccount('KyberProvider', kyberProvider.address);
    });

    withData({
        _1_ETH_to_10_DAI: [0, 1, "ETH", "DAI", "10", true],
        _2_ETH_to_20_DAI: [0, 1, "ETH", "DAI", "20", true],
        _3_ETH_to_30_DAI: [0, 1, "ETH", "DAI", "30", true],
        _4_ETH_to_80_DAI: [0, 1, "ETH", "DAI", "80", true],
        _5_ETH_to_30_DAI: [0, 1, "ETH", "DAI", "30", true],
        _6_ETH_to_30_DAI: [0, 1, "ETH", "DAI", "30", true],
		_7_ETH_to_30_DAI: [0, 1, "ETH", "DAI", "12", true],
        _8_ETH_to_10_DAI: [0, 1, "ETH", "DAI", "29.98", true]
    }, function(customerIndex, merchantIndex, sourceTokenName, targetTokenName, targetTokenAmount, verbose) {
        it(t('anUser', 'transferWithEthers', `Should be able to transferWithEthers ${sourceTokenName} -> ${targetTokenAmount} ${targetTokenName}s.`), async function() {
            // Setup
            const source = {
                address: kyberTokens[sourceTokenName]
            };
            const target = {
                address: kyberTokens[targetTokenName],
                amount: targetTokenAmount
            };
            const customerAddress = accounts[customerIndex];
            const merchantAddress = accounts[merchantIndex];

            const platformFeeString = await settings.getPlatformFee();

            const platformFee = new Amount(
                Number(platformFeeString.toString()) / 100
            );

            balances.addAccount('Customer', customerAddress);
            balances.addAccount('Merchant', merchantAddress);

            const sourceTokenInstance = source;
            const targetTokenInstance = await ERC20.at(target.address);

            await balances.saveBalances('InitialBalances', [
                sourceTokenInstance,
                targetTokenInstance
            ]);

            const customerInitialBalance = await web3.eth.getBalance(customerAddress);
            console.log('customerAddress Initial    ', customerInitialBalance.toString());

            const ordersUrl = `${appConfig.getStablePayApiUrl().get()}/orders`;
            const stablePayWrapper = new StablePayWrapper(stablePay, new OrderDataBuilder(ordersUrl), sourceTokenInstance, verbose);

            // Invocation
            const data = {
                sourceAddress: source.address,
                targetAmount: target.amount,
                targetAddress: target.address,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            };
            const result = await stablePayWrapper.transferWithEthers(data, {from: customerAddress, gas: maxGas});

            assert(result.success);
            console.log(JSON.stringify(result.result));
            const amounts = result.amounts;

            const vaultAmount = new Amount(
                (Number(target.amount) * platformFee.value / 100),
                await targetTokenInstance.decimals()
            );
            
            await balances.saveBalances('FinalBalances', [
                sourceTokenInstance,
                targetTokenInstance
            ]);

            const resultBalances = balances.getBalances('FinalBalances', 'InitialBalances');
            console.log(resultBalances);

            const vaultSourceTokenBalance = resultBalances.getBalance('Vault', sourceTokenInstance);
            const vaultTargetTokenBalance = resultBalances.getBalance('Vault', targetTokenInstance);
            assert(vaultSourceTokenBalance.isMinusEquals("0"));

            console.log(vaultAmount);
            console.log(vaultAmount.asWeisFixed());
            console.log(vaultTargetTokenBalance);
            assert(vaultTargetTokenBalance.isMinusEquals(vaultAmount.asWeisFixed()));

            const stablePaySourceTokenBalance = resultBalances.getBalance('StablePay', sourceTokenInstance);
            const stablePayTargetTokenBalance = resultBalances.getBalance('StablePay', targetTokenInstance);
            assert(stablePaySourceTokenBalance.isMinusEquals("0"));
            assert(stablePayTargetTokenBalance.isMinusEquals("0"));

            const kyberProviderSourceTokenBalance = resultBalances.getBalance('KyberProvider', sourceTokenInstance);
            const kyberProviderTargetTokenBalance = resultBalances.getBalance('KyberProvider', targetTokenInstance);
            assert(kyberProviderSourceTokenBalance.isMinusEquals("0"));
            assert(kyberProviderTargetTokenBalance.isMinusEquals("0"));

            const toAmount = new Amount(
                Number(target.amount) - vaultAmount.value,
                await targetTokenInstance.decimals()
            );
            const merchantSourceTokenBalance = resultBalances.getBalance('Merchant', sourceTokenInstance);
            const merchantTargetTokenBalance = resultBalances.getBalance('Merchant', targetTokenInstance);
            assert(merchantSourceTokenBalance.isMinusEquals("0"));
            assert(merchantTargetTokenBalance.isMinusEquals(toAmount.asWeisFixed()));

            const customerSourceTokenBalance = resultBalances.getBalance('Customer', sourceTokenInstance);
            const customerTargetTokenBalance = resultBalances.getBalance('Customer', targetTokenInstance);

            const gasUsed = result.tx.gasUsed;
            console.log('gasUsed   ', gasUsed);
            const gasPrice = await web3.eth.getGasPrice();
            console.log('gasPrice   ', gasPrice);
            const txFee = gasPrice * gasUsed;
            console.log('txFee  ', txFee);


            const customerFinalBalance = await web3.eth.getBalance(customerAddress);
            console.log('customerAddress Final    ', customerFinalBalance.toString());
            console.log(customerSourceTokenBalance.minusString());
            console.log(amounts.min);
            console.log(amounts.max);
            console.log(customerTargetTokenBalance.minusString());

            //assert(customerSourceTokenBalance.minus().times(-1).gte(amounts.min));
            //assert(customerSourceTokenBalance.minus().times(-1).lte(amounts.max));
            //assert(customerTargetTokenBalance.isMinusEquals("0"));
        });
    });
});