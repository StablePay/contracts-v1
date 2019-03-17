//

const ERC20 = artifacts.require("./erc20/ERC20.sol");
const { BigNumber } = require('bignumber.js');

const { providerEngine } = require('../test/util/provider_engine');
const { ContractWrapperByAccount } = require('../test/util/contractWrapper');

const UniswapSwappingProvider = artifacts.require("./providers/UniswapSwappingProvider.sol");


const UniswapOrderFactory = require('../test/factories/UniswapOrderFactory');

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;
const { printBalanceOf } = require('../test/util/payUtil');

contract('UniswapSwappingProviderSwapTokenTest', (accounts) => {
    const appConf = require('../config')('ganache');

    const uniswapConf = appConf.kyber;
   // const uniswapContracts = uniswapConf.contracts;
    const uniswapTokens = uniswapConf.tokens;
    const kncTokenAddress = uniswapTokens.KNC;
    const omgTokenAddress = uniswapTokens.OMG;

    let owner = accounts[0];

    let customerAddress = accounts[1];
    let merchantAddress = accounts[2];


    let uniswapProvider;


    let sourceErc20;
    let targetErc20;

    beforeEach('Deploying contract for each test', async () => {
        // kyberProxy = await KyberNetworkProxy.at(uniswapContracts.KyberNetworkProxy);
        // assert(kyberProxy);
        // assert(kyberProxy.address);

        uniswapProvider = await UniswapSwappingProvider.deployed();
        assert(uniswapProvider);
        assert(uniswapProvider.address);

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
        it(t('anUser', 'swapToken', 'Should be able to swap any token.'), async function() {
            // Setup
            const sourceToken = {
                name: 'KNC',
                instance: sourceErc20,
                amountWei: "10000"
            };
            const targetToken = {
                name: 'OMG',
                instance: targetErc20,
                amountWei: "10000"
            };

            // Get the initial balances (source and target tokens) for customer and merchant.
            await sourceErc20.transfer(customerAddress, sourceToken.amountWei, {from: owner});

            const initialCustomerSourceBalance = await sourceErc20.balanceOf(customerAddress);
            assert(new BigNumber(initialCustomerSourceBalance).toNumber() > 0);
            const initialCustomerTargetBalance = await targetErc20.balanceOf(customerAddress);

            const initialMerchantSourceBalance = await sourceErc20.balanceOf(merchantAddress);
            const initialMerchantTargetBalance = await targetErc20.balanceOf(merchantAddress);

            await sourceErc20.transfer(
                uniswapProvider.address,
                sourceToken.amountWei,
                {from: customerAddress}
            );

            const initialSwappingProviderSourceBalance = await sourceErc20.balanceOf(uniswapProvider.address);
            assert.equal(initialSwappingProviderSourceBalance, sourceToken.amountWei);

            const orderArray = new UniswapOrderFactory({
                sourceToken: sourceToken.instance.address,
                targetToken: targetToken.instance.address,
                amountWei: targetToken.amountWei,
                merchantAddress: merchantAddress
            }).createOrder();

            //Invocation
           /* const _uniswapProvider = ContractWrapperByAccount(
                uniswapProvider.abi,
                uniswapProvider.address,
                providerEngine,
                customerAddress
            );*/


            //console.log('before testGetExpectedRateResult');
            //const proxyResult = await _uniswapProvider.proxy();
            //console.log(proxyResult);
            //console.log('_kyberProvider.proxy', `"${proxyResult}"`);

            assert.equal(proxyResult, kyberProxy.address);
            assert(proxyResult === kyberProxy.address);

            //console.log('kyberProxy.address', `"${kyberProxy.address}"`);
            const er = await uniswapProvider.getExpectedRate(
                sourceToken.instance.address,
                targetToken.instance.address,
                targetToken.amountWei
            );

            /*const testGetExpectedRateResult = await uniswapProvider.getExpectedRate(
                targetToken.amountWei,
                sourceToken.instance.address,
                targetToken.instance.address
            );
            console.log('expectedRate   ', testGetExpectedRateResult[0].toString());
            console.log('slippageRate   ', testGetExpectedRateResult[1].toString());
            assert(testGetExpectedRateResult);*/

            const result = await uniswapProvider.swapToken(orderArray);

//            console.log(result);
            //         assert(false);

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