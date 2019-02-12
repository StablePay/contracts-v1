const chai = require('chai');
const BigNumber = require('bignumber.js');
const RatesCalculator = require('../test/util/expectedRate/RatesCalculator');

const contracts = require('../build/contracts.json');
const providersMap = new Map();
for (const key in contracts.data) {
    if (contracts.data.hasOwnProperty(key)) {
        const element = contracts.data[key];
        providersMap.set(element.key, element.value);
    }
}

const KyberSwappingProvider = artifacts.require("./providers/KyberSwappingProvider.sol");
const StablePay = artifacts.require("./StablePay.sol");
const StablePayStorage = artifacts.require("./base/StablePayStorage.sol");
const KyberNetworkProxyInterface = artifacts.require("./kyber/KyberNetworkProxyInterface.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");

const KyberOrderFactory = require('../test/factories/KyberOrderFactory');

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;

const { getBalances, printBalance } = require('../test/util/payUtil');

contract('StablePay_KyberSwappingProviderSwapTokenTest', (accounts) => {
    const appConf = require('../config')('ganache');

    const kyberConf = appConf.kyber;
    const kyberContracts = kyberConf.contracts;
    const kyberTokens = kyberConf.tokens;
    const kncTokenAddress = kyberTokens.KNC;
    const omgTokenAddress = kyberTokens.OMG;
    
    let owner = accounts[0];

    let customerAddress = accounts[1];
    let merchantAddress = accounts[2];

    let kyberProvider;
    let kyberProxy;
    let stablePay;
    let daiToken;
    let zrxToken;

    let sourceErc20;
    let targetErc20;

    beforeEach('Deploying contract for each test', async () => {
        kyberProxy = await KyberNetworkProxyInterface.at(kyberContracts.KyberNetworkProxy);
        assert(kyberProxy);
        assert(kyberProxy.address);

        kyberProvider = await KyberSwappingProvider.deployed();
        assert(kyberProvider);
        assert(kyberProvider.address);

        stablePay = await StablePay.deployed();
        assert(stablePay);
        assert(stablePay.address);

        stablePayStorage = await StablePayStorage.deployed();
        assert(stablePayStorage);
        assert(stablePayStorage.address);

        sourceErc20 = await ERC20.at(kncTokenAddress);
        assert(sourceErc20);
        assert(sourceErc20.address);

        targetErc20 = await ERC20.at(omgTokenAddress);
        assert(targetErc20);
        assert(targetErc20.address);
    });

    withData({
        _1_100: ["100", false]//,
        //_2_200: ["200", false],
        //_3_300: ["300", false],
        //_4_400: ["400", false]
    }, function(targetTokenAmount, printBalances) {
        it(t('anUser', 'swapToken', 'Should be able to swap tokens.'), async function() {
            // Setup
            const sourceToken = {
                name: 'KNC',
                instance: sourceErc20
            };
            const targetToken = {
                name: 'OMG',
                instance: targetErc20,
                amount: targetTokenAmount
            };

            // Get the initial balances (source and target tokens) for customer and merchant.
            const ratesCalculator = new RatesCalculator(kyberProxy, stablePayStorage);
            const resultRates = await ratesCalculator.calculateRates(sourceToken.instance.address, targetToken.instance.address, targetTokenAmount);
            const {minRate, maxRate, minAmount, maxAmount} = resultRates;

            console.log(JSON.stringify(resultRates));

            sourceToken.amount = maxAmount;

            await sourceErc20.transfer(customerAddress, sourceToken.amount, {from: owner});
            
            const customerAddressInitial = await getBalances(customerAddress, sourceToken, targetToken);
            const merchantAddressInitial = await getBalances(merchantAddress, sourceToken, targetToken);
            const kyberProviderAddressInitial = await getBalances(kyberProvider.address, sourceToken, targetToken);
            const stablePayAddressInitial = await getBalances(stablePay.address, sourceToken, targetToken);

            console.log(`${minAmount.toString()}-${maxAmount.toString()} ${sourceToken.name} => ${targetToken.amount} ${targetToken.name}.`);

            await sourceErc20.approve(
                stablePay.address,
                sourceToken.amount.toString(),
                {from: customerAddress}
            );

            const orderArray = new KyberOrderFactory({
                sourceToken: sourceToken.instance.address,
                targetToken: targetToken.instance.address,
                sourceAmount: sourceToken.amount,
                targetAmount: targetToken.amount,
                minRate: minRate,
                maxRate: maxRate,
                merchantAddress: merchantAddress
            }).createOrder();
            
            const kyberProviderKey = providersMap.get('KyberNetwork_v1');

            //Invocation
            
            console.log(`111`);
            const result = await stablePay.payWithToken(orderArray, [kyberProviderKey], {
                from: customerAddress,
                gas: 2000000
            });

            // Assertions
            assert(result);

            const customerAddressFinal = await getBalances(customerAddress, sourceToken, targetToken);
            const merchantAddressFinal = await getBalances(merchantAddress, sourceToken, targetToken);
            const kyberProviderAddressFinal = await getBalances(kyberProvider.address, sourceToken, targetToken);
            const stablePayAddressFinal = await getBalances(stablePay.address, sourceToken, targetToken);

            const customerBalances = printBalance("Customer", customerAddressInitial, customerAddressFinal, printBalances);
            const merchantBalances = printBalance("Merchant", merchantAddressInitial, merchantAddressFinal, printBalances);
            const kyberProviderBalances = printBalance("KyberProvider", kyberProviderAddressInitial, kyberProviderAddressFinal, printBalances);
            const stablePayBalances = printBalance("StablePay", stablePayAddressInitial, stablePayAddressFinal, printBalances);

            assert.equal(BigNumber(stablePayBalances.get(sourceToken.name).toString()).toString(), 0);
            assert.equal(BigNumber(stablePayBalances.get(targetToken.name).toString()).toString(), 0);

            assert.equal(BigNumber(kyberProviderBalances.get(sourceToken.name).toString()).toString(), 0);
            assert.equal(BigNumber(kyberProviderBalances.get(targetToken.name).toString()).toString(), 0);

            assert(BigNumber(customerBalances.get(sourceToken.name).toString()).times(-1).gte(minAmount));
            assert(BigNumber(customerBalances.get(sourceToken.name).toString()).times(-1).lte(maxAmount));
            assert.equal(BigNumber(customerBalances.get(targetToken.name).toString()).toString(), 0);

            assert.equal(BigNumber(merchantBalances.get(sourceToken.name).toString()).toString(), 0);
            assert.equal(BigNumber(merchantBalances.get(targetToken.name).toString()).toString(), targetToken.amount);
        });
    });
});