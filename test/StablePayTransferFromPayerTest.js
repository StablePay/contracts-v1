const _ = require('lodash');
const  { BigNumber } = require('0x.js');
const withData = require('leche').withData;

//contracts
const StandardTokenMock = artifacts.require("./mock/StandardTokenMock.sol");
const StablePayMock = artifacts.require("./mock/StablePayMock.sol");

//utils
const { EXCHANGE, ERC20PROXY, WETH9} = require('./util/addresses');
const t = require('./util/TestUtil').title;



contract('StablePayTransferFromPayerTest', accounts => {
    let owner = accounts[0];
    let initialAmount = 90000000000;

    let stablePay;
    let erc20;


    beforeEach('Setup', async () => {
        erc20 = await StandardTokenMock.new(owner, initialAmount);
        stablePay = await StablePayMock.new(ERC20PROXY, EXCHANGE, WETH9);

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
                await stablePay._transferFromPayer(
                    erc20.address,
                    payer,
                    tokensToTransfer
                );

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');

                const balance = await erc20.balanceOf(stablePay.address);
                assert.equal(new BigNumber(balance).sub(tokensToTransfer).toNumber(), 0);
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes("revert"));
            }
        });
    });
});