const StandardTokenMock = artifacts.require("./mock/StandardTokenMock.sol");
const StablePayMock = artifacts.require("./mocks/StablePayMock.sol");

const { EXCHANGE, ERC20PROXY, WETH9 } = require('./util/addresses');
const { providerEngine } = require('./util/provider_engine');
const { ContractWrapper } = require('./util/contractWrapper');

const leche = require('leche');
const withData = leche.withData;
const t = require('./util/TestUtil').title;

contract('StablePayCheckAllowanceTest', accounts => {
    let owner = accounts[0];
    let initialAmount = 90000000000;

    let stablePay;
    let erc20;

    beforeEach('Deploying contract for each test', async () => {
        erc20 = await StandardTokenMock.new(owner, initialAmount);
        stablePay = await StablePayMock.new(ERC20PROXY, EXCHANGE, WETH9);    
    });

    withData({
        _1_5_5_false: [5, 5, false],
        _2_10_5_false: [10, 5, false],
        _3_5_10_true: [5, 10, true],
        _4_5_6_true: [5, 6, true]
    }, function(tokensToApprove, tokensToCheck, mustFail) {
        it(t('anUser', 'checkAllowance', 'Should be able (or not) to check if tokens are allowed.', mustFail), async function() {
            //Setup
            const payer = accounts[0];

            await erc20.approve(stablePay.address, tokensToApprove, {from: payer});
            
            //Invocation
            try {
                const _stablePay = ContractWrapper(StablePayMock.abi, stablePay.address, providerEngine, accounts);
                await _stablePay._checkAllowance(
                    erc20.address,
                    payer,
                    tokensToCheck
                );

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert(error.message.includes("Not enough allowed tokens."));
            }
        });
    });
});