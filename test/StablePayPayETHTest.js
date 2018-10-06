const StablePay = artifacts.require("./StablePay.sol");
const ERC20 = artifacts.require("./erc20/ERC20.sol");
const WETH = artifacts.require("./erc20/WETH9.sol");
const { BigNumber } = require('0x.js');
const { createOrder, getRandomFutureDateInSeconds } = require('./util/orderUtil');
const { toBaseUnitAmount } = require('./util/tokenUtil');
const { NULL_ADDRESS, ZERO } =require('./util/constants');
const { EXCHANGE, ERC20PROXY, ZRXTOKEN, WETH9, DUMMYERC20TOKEN1 } = require('./util/addresses');
const { providerEngine } = require('./util/provider_engine');
const { ContractWrapperByAccount } = require('./util/contractWrapper');

const leche = require('leche');
const withData = leche.withData;
const t = require('./util/TestUtil').title;

contract('StablePayPayTokenTest', accounts => {
    const DAITOKEN = DUMMYERC20TOKEN1;
    let owner = accounts[0];
    let maker = accounts[0]; // Maker giving DAI for weth
    let payer = accounts[1]; // Payer expecting to pay with ETH
    let seller = accounts[2]; // Seller expecting DAI

    let stablePay;
    let daiToken;
    let zrxToken;
    let weth;

    let orderInput;

    beforeEach('Deploying contract for each test', async () => {
        stablePay = await StablePay.new(ERC20PROXY, EXCHANGE, WETH9);
        daiToken = await ERC20.at(DAITOKEN);
        zrxToken = await ERC20.at(ZRXTOKEN);
        weth = await WETH.at(WETH9);

        orderInput = {
            exchangeAddress: EXCHANGE,
            makerAddress: maker, // Who creates the order
            takerAddress: NULL_ADDRESS, // Who "takes" the order.
            senderAddress: NULL_ADDRESS, // Who "relays" the transaction.
            feeRecipientAddress: NULL_ADDRESS,
            expirationTimeSeconds: getRandomFutureDateInSeconds(),
            makerAssetAmount: 10,
            takerAssetAmount: 5,
            erc20MakerAddress: DAITOKEN,
            erc20TakerAddress: WETH9,
            makerFee: ZERO,
            takerFee: ZERO,
        };
        assert(stablePay);
        assert(stablePay.address);
        assert(daiToken);
        assert(daiToken.address);
        assert(zrxToken);
        assert(zrxToken.address);
    });


    withData({
        _1_zeroAmount: [5]
    }, function(unitsOfTokens) {
        it(t('anUser', 'pay', 'Should be able to pay using ETH.'), async function() {
            const signedOrder = await createOrder(orderInput, providerEngine);
            const order = signedOrder.order;
            //console.log('Signed Order: ', signedOrder);

            const amountOfTokens = toBaseUnitAmount(unitsOfTokens);

            //Setup
            const initialOwnerDaiBalance = await daiToken.balanceOf(owner);
            assert(new BigNumber(initialOwnerDaiBalance).toNumber() > 0);

            const initialOwnerZrxBalance = await zrxToken.balanceOf(owner);
            assert(new BigNumber(initialOwnerZrxBalance).toNumber() > 0);

            // Checking Maker DAI Balance
            const initialMakerBalance = await daiToken.balanceOf(maker);
            await daiToken.transfer(maker, order.makerAssetAmount, {from: owner});
            const finalMakerBalance = await daiToken.balanceOf(maker);

            assert(new BigNumber(initialMakerBalance).add(new BigNumber(finalMakerBalance)).toNumber() >= new BigNumber(order.makerAssetAmount).toNumber());

            // Checking Payer ZRX Balance
            const initialPayerBalance = await zrxToken.balanceOf(payer);
            await zrxToken.transfer(payer, order.takerAssetAmount, {from: owner});
            const finalPayerBalance = await zrxToken.balanceOf(payer);
            assert(new BigNumber(initialPayerBalance).add(new BigNumber(finalPayerBalance)).toNumber() >= new BigNumber(order.takerAssetAmount).toNumber());

            await daiToken.approve(
                ERC20PROXY,
                order.makerAssetAmount,
                {from: maker}
            );
            await zrxToken.approve(
                stablePay.address,
                order.takerAssetAmount,
                {from: payer}
            );

            // await weth.approve(
            //     stablePay.address,
            //     order.takerAssetAmount
            //     ,
            //     {from: stablePay.address}
            // );

            const initialMakerZrxBalance = await zrxToken.balanceOf(maker);
            const initialSellerDaiBalance = await daiToken.balanceOf(seller);
            const initialPayerZrxBalance = await zrxToken.balanceOf(payer);
            const initialStablePayDaiBalance = await daiToken.balanceOf(stablePay.address);
            const initialWETHBalance = await weth.balanceOf(stablePay.address);

            //Invocation
            const _stablePay = ContractWrapperByAccount(StablePay.abi, stablePay.address, providerEngine, payer);
            const result = await _stablePay.payETH(
                signedOrder.orderArray,
                //ZRXTOKEN,
                DAITOKEN,
                seller,
                amountOfTokens.toString(),
                signedOrder.signature
                ,{value: amountOfTokens.toNumber(),  gasLimit: 210000}
            );

            // Assertions
            assert(result);

            const printBalanceOf = (who, token, initial, final) => {
                console.log(`${who.padEnd(10)} ${token.padEnd(4)}: ${initial}    ->  ${final} = ${new BigNumber(final).sub(new BigNumber(initial)).toNumber()}`);
            };

            // const finalMakerZrxBalance = await zrxToken.balanceOf(maker);
            // const finalSellerDaiBalance = await daiToken.balanceOf(seller);
            // const finalPayerZrxBalance = await zrxToken.balanceOf(payer);
            // const finalStablePayDaiBalance = await daiToken.balanceOf(stablePay.address);
            const finalWETHBalance = await weth.balanceOf(stablePay.address);

            // printBalanceOf('Maker', 'ZRX', initialMakerZrxBalance, finalMakerZrxBalance);
            // printBalanceOf('Seller', 'DAI', initialSellerDaiBalance, finalSellerDaiBalance);
            // printBalanceOf('Payer', 'ZRX', initialPayerZrxBalance, finalPayerZrxBalance);
            // printBalanceOf('StablePay', 'DAI', initialStablePayDaiBalance, finalStablePayDaiBalance);
            printBalanceOf('finalWETHBalance', 'WETH', initialWETHBalance, finalWETHBalance);
        });
    });
});