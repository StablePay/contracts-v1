const {
    title: t,
    ETH_ADDRESS,
} = require('../util/consts');
const withData = require('leche').withData;
const KyberOrderFactory = require('../factories/KyberOrderFactory');

// Mock Smart Contracts 
const Mock = artifacts.require("./mock/Mock.sol");
const SimpleToken = artifacts.require("./mock/token/SimpleToken.sol");

// Smart Contracts
const DexAgSwappingProvider = artifacts.require("../../contracts/providers/DexAgSwappingProvider.sol");

contract('DexAgSwappingProviderTest', accounts => {
    const owner = accounts[0];
    const account1 = accounts[1];
    const account2 = accounts[2];
    let swappingProvider;
    let dexAgProxyMock;
    let stablePayMock;
    let token;

    beforeEach('Setup', async () => {
        stablePayMock = await Mock.new();
        dexAgProxyMock = await Mock.new();
        swappingProvider  = await DexAgSwappingProvider.new(
            stablePayMock.address,
            dexAgProxyMock.address,
        );
    });

    describe('#hasValidCallData modifier', () => {
        it(t('anUser', 'swapToken', 'Should fail if order does not have bytes calldata', true), async () => {
            // Setup
            const customerAddress = account1;
            const merchantAddress = account2;
            const sourceAmount = 100;
            const targetAmount = 100;
            token = await SimpleToken.new({from: customerAddress});
            token.transfer(swappingProvider.address, 100, { from: customerAddress });

            const orderArray = new KyberOrderFactory({
                sourceToken: token.address,
                targetToken: token.address,
                sourceAmount: sourceAmount,
                targetAmount: targetAmount,
                minRate: sourceAmount,
                maxRate: targetAmount,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            }).createOrder();
    
            try {
                // Invocation
                const result = await swappingProvider.swapToken(orderArray, {from: stablePayMock.address});

                console.log('result', result);
    
                // Assertions
                fail(true, "It should have failed because order does not have valid call data.")
            } catch (error) {
                console.error(error)
                // Assertions
                assert(error);
                assert.equal(error.reason, "CallData is empty.", "Error should be because empty call data");
            }
        });
    
        it(t('anUser', 'swapEther', 'Should fail if order does not have bytes calldata', true), async () => {
            // Setup
            const customerAddress = account1;
            const merchantAddress = account2;
            const sourceAmount = 100;
            const targetAmount = 100;
            token = await SimpleToken.new({from: customerAddress});
            token.transfer(swappingProvider.address, 100, { from: customerAddress });

            const orderArray = new KyberOrderFactory({
                sourceToken: token.address,
                targetToken: token.address,
                sourceAmount: sourceAmount,
                targetAmount: targetAmount,
                minRate: sourceAmount,
                maxRate: targetAmount,
                merchantAddress: merchantAddress,
                customerAddress: customerAddress
            }).createOrder();
    
            try {
                // Invocation
                const result = await swappingProvider.swapEther(orderArray, {from: stablePayMock.address, value: 100 });

                console.log('result', result);
    
                // Assertions
                fail(true, "It should have failed because order does not have valid call data.")
            } catch (error) {
                console.error(error)
                // Assertions
                assert(error);
                assert.equal(error.reason, "CallData is empty.", "Error should be because empty call data");
            }
        });
    });

  
});