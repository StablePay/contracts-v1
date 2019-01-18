const contracts = require('../build/contracts.json');
const providersMap = new Map();
for (const key in contracts.data) {
    if (contracts.data.hasOwnProperty(key)) {
        const element = contracts.data[key];
        providersMap.set(element.providerKey, element.providerAddress);
    }
}

const KyberSwappingProvider = artifacts.require("./providers/KyberSwappingProvider.sol");
const StablePay = artifacts.require("./StablePay.sol");
const KyberNetworkInterface = artifacts.require("./kyber/KyberNetworkInterface.sol");
const KyberNetworkProxy = artifacts.require("./kyber/KyberNetworkProxy.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");
const { BigNumber } = require('0x.js');
const { createOrder, getRandomFutureDateInSeconds } = require('../test/util/orderUtil');
const { toBaseUnitAmount } = require('../test/util/tokenUtil');
const { providerEngine } = require('../test/util/provider_engine');
const { ContractWrapperByAccount } = require('../test/util/contractWrapper');

const KyberOrderFactory = require('../test/factories/KyberOrderFactory');

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;
const { printBalanceOf } = require('../test/util/payUtil');

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
        kyberProxy = await KyberNetworkProxy.at(kyberContracts.KyberNetworkProxy);
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
        _1_zeroAmount: [5]
    }, function(unitsOfTokens) {
        it(t('anUser', 'swapToken', 'Should be able to swap tokens.'), async function() {
            // Setup
            const sourceToken = {
                name: 'KNC',
                instance: sourceErc20,
                amountWei: web3.utils.toWei("0.01",'ether').toString()
            };
            const targetToken = {
                name: 'OMG',
                instance: targetErc20,
                amountWei: web3.utils.toWei("0.01",'ether').toString()
            };

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, sourceToken.amountWei, {from: owner});

            const initialCustomerSourceBalance = await sourceErc20.balanceOf(customerAddress);
            assert(new BigNumber(initialCustomerSourceBalance).toNumber() > 0);
            const initialCustomerTargetBalance = await targetErc20.balanceOf(customerAddress);

            const initialMerchantSourceBalance = await sourceErc20.balanceOf(merchantAddress);
            const initialMerchantTargetBalance = await targetErc20.balanceOf(merchantAddress);

            const initialKyberProviderSourceBalance = await sourceErc20.balanceOf(kyberProvider.address);
            const initialKyberProviderTargetBalance = await targetErc20.balanceOf(kyberProvider.address);
            console.log('Kyber SOURCE Balance:  ', initialKyberProviderSourceBalance);
            console.log('Kyber TARGET Balance:  ', initialKyberProviderTargetBalance);

            await sourceErc20.approve(
                stablePay.address,
                sourceToken.amountWei,
                {from: customerAddress}
            );

            const _kyberProvider = ContractWrapperByAccount(
                KyberSwappingProvider.abi,
                kyberProvider.address,
                providerEngine,
                customerAddress
            );
            const testGetExpectedRateResult = await _kyberProvider.testGetExpectedRate(
                targetToken.amountWei,
                sourceToken.instance.address,
                targetToken.instance.address
            );
            console.log('expectedRate   ', testGetExpectedRateResult[0].toString());
            console.log('slippageRate   ', testGetExpectedRateResult[1].toString());
            assert(testGetExpectedRateResult);

            const orderArray = new KyberOrderFactory({
                sourceToken: sourceToken.instance.address,
                targetToken: targetToken.instance.address,
                amountWei: targetToken.amountWei,
                merchantAddress: merchantAddress
            }).createOrder();

            //Invocation

            const _stablePay = ContractWrapperByAccount(
                StablePay.abi,
                stablePay.address,
                providerEngine,
                customerAddress
            );

            const kyberProviderKey = providersMap.get('KyberNetwork_v1');
            console.log(`KyberNetwork_v1 -> ${kyberProviderKey}`);

            const stablePayExpectedRateResult = await _stablePay.getExpectedRate(
                kyberProviderKey,
                sourceToken.instance.address,
                targetToken.instance.address,
                targetToken.amountWei
            );
            console.log('stablePayExpectedRateResult    ', stablePayExpectedRateResult);
            
            console.log(`Before stablePay.swapToken`);
            const result = await _stablePay.swapToken(orderArray, [kyberProviderKey]);

            assert(false);
            console.log(result);

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