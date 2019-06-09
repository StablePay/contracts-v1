const chai = require('chai');

const KyberSwappingProvider = artifacts.require("./providers/KyberSwappingProvider.sol");
const IStablePay = artifacts.require("./interface/IStablePay.sol");
const Settings = artifacts.require("./base/Settings.sol");
const Vault = artifacts.require("./base/Vault.sol");
const KyberNetworkProxyInterface = artifacts.require("./kyber/KyberNetworkProxyInterface.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");

const appConfig = require('../src/config');

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;
const Balances = require('../src/balances/Balances');
const Amount = require('../src/amounts/Amount');
const ProcessArgs = require('../src/utils/ProcessArgs');
const OrderDataBuilder = require('../src/builder/ByApiOrderDataBuilder');
const StablePayWrapper = require('../src/contracts/StablePayWrapper');
const processArgs = new ProcessArgs();

contract('StablePayPayWithTokenPerApiTest', (accounts) => {
    const appConf = require('../config')(processArgs.network());
    const stablepayConf = appConf.stablepay;
    const stablepayContracts = stablepayConf.contracts;
    const stablepayProviders = stablepayConf.providers;
    const kyberConf = appConf.kyber;
    const kyberContracts = kyberConf.contracts;
    const kyberTokens = kyberConf.tokens;

    let vault;
    let settings;
    let kyberProvider;
    let kyberProxy;
    let stablePay;
    let balances;

    beforeEach('Deploying contract for each test', async () => {
        kyberProxy = await KyberNetworkProxyInterface.at(kyberContracts.KyberNetworkProxy);
        assert(kyberProxy);
        assert(kyberProxy.address);

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
        //_1_DAI_to_10_DAI: [0, 1, "OMG", "KNC", "30", true],
                
        _1_DAI_to_10_DAI: [0, 1, "DAI", "DAI", "10", true],
        //_2_KNC_to_20_DAI: [0, 1, "KNC", "DAI", "20", true],
        //_3_KNC_to_30_DAI: [0, 1, "KNC", "DAI", "30", true],
        //_4_KNC_to_80_DAI: [0, 1, "KNC", "DAI", "80", true],
        _5_OMG_to_31_DAI: [0, 1, "OMG", "DAI", "31", true],
        _6_MANA_to_30_DAI: [0, 1, "MANA", "DAI", "30", true],
        //_7_ZIL_to_25_DAI: [0, 1, "ZIL", "DAI", "25", true],
        _8_ELF_to_32_DAI: [0, 1, "ELF", "DAI", "32", true],
        //_9_SNT_to_41_DAI: [0, 1, "SNT", "DAI", "41", true],
        _11_OMG_to_15_DAI: [0, 1, "OMG", "DAI", "15", true],
    }, function(customerIndex, merchantIndex, sourceTokenName, targetTokenName, targetTokenAmount, verbose) {
        it(t('anUser', 'payWithToken', `Should be able to payWithToken ${sourceTokenName} -> ${targetTokenAmount} ${targetTokenName}s.`), async function() {
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

            const sourceTokenInstance = await ERC20.at(source.address);
            const targetTokenInstance = await ERC20.at(target.address);

            await balances.saveBalances('InitialBalances', [
                sourceTokenInstance,
                targetTokenInstance
            ]);
            
            const url = appConfig.getOrderFactoryUrl().get();
            const stablePayWrapper = new StablePayWrapper(stablePay, new OrderDataBuilder(url), sourceTokenInstance, verbose);

            // Invocation
            const data = {
                sourceAddress: source.address,
                targetAmount: target.amount,
                targetAddress: target.address,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            };
            //GasUsed Ropsten: 778619
            const result = await stablePayWrapper.transferWithTokens(data, {from: customerAddress, gas: 8000000});//6721975

            assert(result.success);
            const amounts = result.amounts;

            let vaultAmount;
            if(source.address === target.address) {
                vaultAmount = new Amount(0, 0);
            } else {
                vaultAmount = new Amount(
                    Number(target.amount) * platformFee.value / 100,
                    await targetTokenInstance.decimals()
                );
            }
            
            await balances.saveBalances('FinalBalances', [
                sourceTokenInstance,
                targetTokenInstance
            ]);

            const resultBalances = balances.getBalances('FinalBalances', 'InitialBalances');

            const vaultSourceTokenBalance = resultBalances.getBalance('Vault', sourceTokenInstance);
            const vaultTargetTokenBalance = resultBalances.getBalance('Vault', targetTokenInstance);
            assert(vaultSourceTokenBalance.isMinusEquals("0"));
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

            if(source.address === target.address) {
                // Source/target address are the same.
                assert(merchantTargetTokenBalance.isMinusEquals(toAmount.asWeisFixed()));
            } else {
                assert(merchantSourceTokenBalance.isMinusEquals("0"));
                assert(merchantTargetTokenBalance.isMinusEquals(toAmount.asWeisFixed()));
            }

            const customerSourceTokenBalance = resultBalances.getBalance('Customer', sourceTokenInstance);
            const customerTargetTokenBalance = resultBalances.getBalance('Customer', targetTokenInstance);

            console.log('Customer Source         ', customerSourceTokenBalance);
            console.log('Customer Source         ', customerSourceTokenBalance.minusString());
            console.log('Customer Target         ', customerTargetTokenBalance);
            console.log('Customer Target         ', customerTargetTokenBalance.minusString());
            console.log(amounts.min);
            console.log(amounts.max);

            if(source.address === target.address) {
                assert(customerSourceTokenBalance.minus().times(-1).gte(amounts.max));
                assert(customerSourceTokenBalance.minus().times(-1).lte(amounts.min));
                
                // Source/target address are the same.
                const customerAmount = new Amount(
                    target.amount,
                    await targetTokenInstance.decimals()
                );
                console.log(customerAmount);
                console.log(customerTargetTokenBalance.minusString());
                console.log(customerAmount.asWeisFixed());
                console.log(customerTargetTokenBalance.minus().times(-1).toString(),'   ', customerAmount.asWeisFixed());
                assert.equal(customerTargetTokenBalance.minus().times(-1).toString(), customerAmount.asWeisFixed());
            } else {
                // TODO Check it
                console.log('Customer Source Balance:   ', customerSourceTokenBalance.minus().times(-1).toString());
                console.log('Amounts MAX:               ', amounts.max);
                console.log('Amounts MIN:               ', amounts.min);
                console.log(customerSourceTokenBalance.minus().times(-1).gte(amounts.max));
                console.log(customerSourceTokenBalance.minus().times(-1).lte(amounts.min));
                
                assert(customerTargetTokenBalance.isMinusEquals("0"));
            }
        });
    });
});