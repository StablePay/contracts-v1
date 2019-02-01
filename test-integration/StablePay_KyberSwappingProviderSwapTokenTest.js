const chai = require('chai');
const BigNumber = require('bignumber.js');
const AmountsCalculator = require('../test/util/expectedRate/AmountsCalculator');

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
const KyberNetworkProxyInterface = artifacts.require("./kyber/KyberNetworkProxyInterface.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");

const KyberOrderFactory = require('../test/factories/KyberOrderFactory');

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;

const { printBalanceOf, getBalances, printBalance } = require('../test/util/payUtil');

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

        sourceErc20 = await ERC20.at(kncTokenAddress);
        assert(sourceErc20);
        assert(sourceErc20.address);

        targetErc20 = await ERC20.at(omgTokenAddress);
        assert(targetErc20);
        assert(targetErc20.address);
    });

    withData({
        _1_001_001: ["2000", "100"]
    }, function(sourceTokenAmount, targetTokenAmount) {
        it(t('anUser', 'swapToken', 'Should be able to swap tokens.'), async function() {
            // Setup
            const sourceToken = {
                name: 'KNC',
                instance: sourceErc20,
                amount: sourceTokenAmount
            };
            const targetToken = {
                name: 'OMG',
                instance: targetErc20,
                amount: targetTokenAmount
            };

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, sourceToken.amount, {from: owner});

            const customerAddressInitial = await getBalances(customerAddress, sourceToken, targetToken);
            const merchantAddressInitial = await getBalances(merchantAddress, sourceToken, targetToken);
            const kyberProviderAddressInitial = await getBalances(kyberProvider.address, sourceToken, targetToken);
            const stablePayAddressInitial = await getBalances(stablePay.address, sourceToken, targetToken);

            console.log(`Source Amount:     ${sourceToken.amount}`);
            console.log(`Target Amount:     ${targetToken.amount}`);

            const getExpectedRateResult_1 = await kyberProxy.getExpectedRate(
                sourceToken.instance.address,
                targetToken.instance.address,
                "1"
            );
            const amountsCalculator = new AmountsCalculator(targetToken.amount);
            const sourceAmountNeeded_1 = amountsCalculator.calculateAmountBased(getExpectedRateResult_1.expectedRate).decimalPlaces(0).toString();
            console.log(`Expected Rate 1:     ${getExpectedRateResult_1.expectedRate}`);
            console.log(`Slippage Rate 1:     ${getExpectedRateResult_1.slippageRate}`);
            console.log(`Source Amount 1:     ${sourceAmountNeeded_1}`);

            const getExpectedRateResult_2 = await kyberProxy.getExpectedRate(
                sourceToken.instance.address,
                targetToken.instance.address,
                sourceAmountNeeded_1
            );
            assert(getExpectedRateResult_2);

            const sourceAmountNeeded_2 = amountsCalculator.calculateAmountBased(getExpectedRateResult_2.slippageRate).decimalPlaces(0).toString();
            console.log(`Expected Rate 2:     ${getExpectedRateResult_2.expectedRate}`);
            console.log(`Slippage Rate 2:     ${getExpectedRateResult_2.slippageRate}`);
            console.log(`Source Amount 2:     ${sourceAmountNeeded_2}`);

            console.log(`${sourceAmountNeeded_2.toString()} ${sourceToken.name} => ${targetToken.amount} ${targetToken.name}.`);

            await sourceErc20.approve(
                stablePay.address,
                sourceAmountNeeded_2.toString(),
                {from: customerAddress}
            );

            const orderArray = new KyberOrderFactory({
                sourceToken: sourceToken.instance.address,
                targetToken: targetToken.instance.address,
                sourceAmount: sourceAmountNeeded_2.toString(),
                targetAmount: targetToken.amount,
                minRate: getExpectedRateResult_2.expectedRate,
                maxRate: getExpectedRateResult_2.slippageRate,
                merchantAddress: merchantAddress
            }).createOrder();

            
            const kyberProviderKey = providersMap.get('KyberNetwork_v1');

            //Invocation
            const result = await stablePay.swapToken(orderArray, [kyberProviderKey], {
                from: customerAddress,
                gas: 1100000
            });

            // Assertions
            assert(result);

            const customerAddressFinal = await getBalances(customerAddress, sourceToken, targetToken);
            const merchantAddressFinal = await getBalances(merchantAddress, sourceToken, targetToken);
            const kyberProviderAddressFinal = await getBalances(kyberProvider.address, sourceToken, targetToken);
            const stablePayAddressFinal = await getBalances(stablePay.address, sourceToken, targetToken);

            const customerBalances = printBalance("Customer", customerAddressInitial, customerAddressFinal);
            const merchantBalances = printBalance("Merchant", merchantAddressInitial, merchantAddressFinal);
            const kyberProviderBalances = printBalance("KyberProvider", kyberProviderAddressInitial, kyberProviderAddressFinal);
            const stablePayBalances = printBalance("StablePay", stablePayAddressInitial, stablePayAddressFinal);

            assert.equal(BigNumber(stablePayBalances.get(sourceToken.name).toString()).toString(), 0);
            assert.equal(BigNumber(stablePayBalances.get(targetToken.name).toString()).toString(), 0);

            assert.equal(BigNumber(kyberProviderBalances.get(sourceToken.name).toString()).toString(), 0);
            assert.equal(BigNumber(kyberProviderBalances.get(targetToken.name).toString()).toString(), 0);

            //assert.equal(BigNumber(customerBalances.get(sourceToken.name).toString()).toString(), 0);
            assert.equal(BigNumber(customerBalances.get(targetToken.name).toString()).toString(), 0);

            assert.equal(BigNumber(merchantBalances.get(sourceToken.name).toString()).toString(), 0);
            assert.equal(BigNumber(merchantBalances.get(targetToken.name).toString()).toString(), targetToken.amount);
            assert(false);
        });
    });
});