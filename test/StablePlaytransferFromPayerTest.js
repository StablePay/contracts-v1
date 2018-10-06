const _ = require('lodash');

const StandardTokenMock = artifacts.require("./mock/StandardTokenMock.sol");
const StandardPay = artifacts.require("./StandardPay.sol");

const  { BigNumber } = require('0x.js');
const { createOrder, getRandomFutureDateInSeconds } = require('./util/orderUtil');
const { NULL_ADDRESS, ZERO } =require('./util/constants');
const { EXCHANGE, ERC20PROXY, ZRXTOKEN, WETH9, DUMMYERC20TOKEN1, DUMMYERC20TOKEN2 } = require('./util/addresses');
const { providerEngine } = require('./util/provider_engine');
const {
    ContractWrapper
} = require('./util/contractWrapper');

const withData = require('leche').withData;
const t = require('./util/TestUtil').title;

contract('StablePlaytransferFromPayerTest', accounts => {
    const DAITOKEN = DUMMYERC20TOKEN1; //our dummy dai token from ganache
    let owner = accounts[0];
    let initialAmount = 90000000000;
    let maker = accounts[0]; // Maker  DAI to ZRX.

    let payer = accounts[1]; // Payer  pays in ZRX
    let seller = accounts[2]; // Seller already has DAI and  will receive more DAI from our contract.

    let stablePay;
    let erc20;
    let orderInput;

    beforeEach('Setup', async () => {
        erc20 = await StandardTokenMock.new(owner, initialAmount);
        stablePay = await StablePAy.new(ERC20PROXY, EXCHANGE, WETH9);

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
            erc20TakerAddress: ZRXTOKEN,
            makerFee: ZERO,
            takerFee: ZERO,
        };
        assert(stablePay);
        assert(stablePay.address);
    });


    withData({
        _1_5_5_false: [5, 5, false],
        _2_10_5_false: [10, 5, false],
        _3_5_10_true: [5, 10, true],
        _4_5_6_true: [5, 6, true]
    }, function(tokensToApprove, tokensToTransfer, mustFail) {
        it(t('anUser', 'transferFromPayer', 'Should be able (or not) to transfer the tokens.', mustFail), async function() {
            //Setup
            const payer = accounts[0];

            await erc20.approve(stablePay.address, tokensToApprove, {from: payer});

            //Invocation
            try {
                await stablePay.transferFromPayer(
                    erc20.address,
                    payer,
                    tokensToTransfer
                );

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');

                const token2meBalance = await erc20.balanceOf(stablePay.address);
                assert.equal(new BigNumber(token2meBalance).sub(tokensToTransfer).toNumber(), 0);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });
});