const KyberSwappingProvider = artifacts.require("./KyberSwappingProvider.sol");
const KyberNetworkProxy = artifacts.require("./kyber/KyberNetworkProxy.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");
const { BigNumber } = require('0x.js');
const { createOrder, getRandomFutureDateInSeconds } = require('./util/orderUtil');
const { toBaseUnitAmount } = require('./util/tokenUtil');
const { providerEngine } = require('./util/provider_engine');
const { ContractWrapperByAccount } = require('./util/contractWrapper');

const KyberOrderFactory = require('./factories/KyberOrderFactory');

const leche = require('leche');
const withData = leche.withData;
const t = require('./util/TestUtil').title;
const { printBalanceOf } = require('./util/payUtil');

contract('KyberSwappingProviderPayTokenTest', (accounts) => {
    const appConf = require('../config')('ganache');

    const kyberConf = appConf.kyber;
    const kyberContracts = kyberConf.contracts;
    const kyberWallets = kyberConf.wallets;
    const kyberPermissions = kyberConf.permissions;
    const kyberTokens = kyberConf.tokens;

    const DAITOKEN = kyberTokens.KNC;
    const ZRXTOKEN = kyberTokens.OMG;
    let owner = accounts[0];
    let maker = accounts[0]; // Maker starts with DAI, and ends with ZRX.
    let payer = accounts[1]; // Payer starts with ZRX, and ends with lower ZRX.
    let seller = accounts[2]; // Seller starts with X DAI, and ends with initial DAIs + the DAIs which were gotten from maker through stablePay.

    let kyberProxy;
    let stablePay;
    let daiToken;
    let zrxToken;

    beforeEach('Deploying contract for each test', async () => {
        kyberProxy = await KyberNetworkProxy.at(kyberContracts.KyberNetworkProxy);
        assert(kyberProxy);
        assert(kyberProxy.address);
        
        stablePay = await KyberSwappingProvider.deployed();
        assert(stablePay);
        assert(stablePay.address);

        daiToken = await ERC20.at(DAITOKEN);
        assert(daiToken);
        assert(daiToken.address);

        zrxToken = await ERC20.at(ZRXTOKEN);
        assert(zrxToken);
        assert(zrxToken.address);
    });


    withData({
        _1_zeroAmount: [5]
    }, function(unitsOfTokens) {
        it(t('anUser', 'payToken', 'Should be able to pay using tokens.'), async function() {
            const order = {
                makerAssetAmountWei: web3.utils.toWei("10"),
                takerAssetAmountWei: web3.utils.toWei("5")
            };

            //Setup
            const initialOwnerDaiBalance = await daiToken.balanceOf(owner);
            assert(new BigNumber(initialOwnerDaiBalance).toNumber() > 0);
            
            const initialOwnerZrxBalance = await zrxToken.balanceOf(owner);
            assert(new BigNumber(initialOwnerZrxBalance).toNumber() > 0);

            // Checking Maker DAI Balance
            const initialMakerDaiBalance = await daiToken.balanceOf(maker);
            await daiToken.transfer(maker, order.makerAssetAmountWei, {from: owner});
            const finalMakerDaiBalance = await daiToken.balanceOf(maker);

            assert(new BigNumber(initialMakerDaiBalance).add(new BigNumber(finalMakerDaiBalance)).toNumber() >= new BigNumber(order.makerAssetAmountWei).toNumber());

            // Checking Payer ZRX Balance 
            const initialPayerBalance = await zrxToken.balanceOf(payer);
            await zrxToken.transfer(payer, order.takerAssetAmountWei, {from: owner});
            const finalPayerBalance = await zrxToken.balanceOf(payer);
            assert(new BigNumber(initialPayerBalance).add(new BigNumber(finalPayerBalance)).toNumber() >= new BigNumber(order.takerAssetAmountWei).toNumber());

            printBalanceOf('Payer', 'ZRX', initialPayerBalance, finalPayerBalance);

            await daiToken.approve(
                kyberContracts.KyberNetworkProxy,
                order.makerAssetAmountWei,
                {from: maker}
            );
            await zrxToken.approve(
                stablePay.address,
                order.takerAssetAmountWei,
                {from: payer}
            );

            const initialMakerZrxBalance = await zrxToken.balanceOf(maker);
            const initialSellerDaiBalance = await daiToken.balanceOf(seller);
            const initialPayerZrxBalance = await zrxToken.balanceOf(payer);
            const initialStablePayDaiBalance = await daiToken.balanceOf(stablePay.address);

            const getExpectedRate = await kyberProxy.getExpectedRate(ZRXTOKEN, DAITOKEN, order.takerAssetAmountWei);
            console.log('getExpectedRate');
            console.log(getExpectedRate);
            const rate = new BigNumber(getExpectedRate[0].toString());
            console.log(rate);

            const orderArray = new KyberOrderFactory({
                sourceToken: ZRXTOKEN,
                targetToken: DAITOKEN,
                amountWei: order.takerAssetAmountWei,
                merchantAddress: seller
            }).createOrder();

            //Invocation
            const _stablePay = ContractWrapperByAccount(KyberSwappingProvider.abi, stablePay.address, providerEngine, payer);
            const result = await _stablePay.payToken(orderArray);

            // Assertions
            assert(result);

            const finalMakerZrxBalance = await zrxToken.balanceOf(maker);
            const finalSellerDaiBalance = await daiToken.balanceOf(seller);
            const finalPayerZrxBalance = await zrxToken.balanceOf(payer);
            const finalStablePayDaiBalance = await daiToken.balanceOf(stablePay.address);

            printBalanceOf('Maker', 'ZRX', initialMakerZrxBalance, finalMakerZrxBalance);
            printBalanceOf('Seller', 'DAI', initialSellerDaiBalance, finalSellerDaiBalance);
            printBalanceOf('Payer', 'ZRX', initialPayerZrxBalance, finalPayerZrxBalance);
            printBalanceOf('StablePay', 'DAI', initialStablePayDaiBalance, finalStablePayDaiBalance);


            // Maker balance assert
  /*          const resultMakerZrxBalance = new BigNumber(finalMakerZrxBalance).sub(new BigNumber(initialMakerZrxBalance)).toNumber();
            const expectedMakerZrxBalance = new BigNumber(order.takerAssetAmountWei.toString()).toNumber();
            assert.equal(resultMakerZrxBalance, expectedMakerZrxBalance);
*/
            // Seller balance assert
            const resultSellerDaiBalance = new BigNumber(finalSellerDaiBalance).sub(new BigNumber(initialSellerDaiBalance)).toNumber();
            const expectedSellerDaiBalance = new BigNumber(order.makerAssetAmountWei.toString()).toNumber();
            //assert.equal(resultSellerDaiBalance, expectedSellerDaiBalance);

            // StablePay balance assert
            assert.equal(new BigNumber(initialStablePayDaiBalance.toString()).toNumber(), new BigNumber(finalStablePayDaiBalance.toString()).toNumber());

            // Payer balance assert
            const resultPayerZrxBalance = new BigNumber(finalPayerZrxBalance).sub(new BigNumber(initialPayerZrxBalance)).toNumber();
            const expectedPayerZrxBalance = new BigNumber(order.takerAssetAmountWei.toString()).mul(-1);
            assert.equal(resultPayerZrxBalance, expectedPayerZrxBalance);
        });
    });
});