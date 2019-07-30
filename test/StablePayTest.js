const withData = require('leche').withData;

const StablePay = artifacts.require("./StablePay.sol");
const StablePayBase = artifacts.require("./base/StablePayBase.sol");

const t = require('./util/consts').title;

contract('StablePayTest', function (accounts) {
    let stablePay;
    let stablePayBase;
    
    beforeEach('Setup contract for each test', async () => {
        stablePay = await StablePay.deployed();
        assert(stablePay);
        assert(stablePay.address);

        stablePayBase = await StablePayBase.deployed();
        assert(stablePayBase);
        assert(stablePayBase.address);
    });

    withData({
        _1_basic: [2]
    }, function(proxyTypeExpected) {
        it(t('anUser', 'proxyType', 'Should be able get the proxy type.', false), async function() {
            // Setup

            // Invocation
            const result = await stablePay.proxyType();
            
            // Assertions
            assert.equal(result.toString(), proxyTypeExpected.toString());
        });
    });

    withData({
        _1_basic: []
    }, function() {
        it(t('anUser', 'implementation', 'Should be able get the proxy implementation address.', false), async function() {
            // Setup
            const expectedAddress = stablePayBase.address;

            // Invocation
            const result = await stablePay.implementation();
            
            // Assertions
            assert.equal(result.toString(), expectedAddress.toString());
        });
    });
});