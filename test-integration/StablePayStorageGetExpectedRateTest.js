const Amount = require('../src/amounts/Amount');
const { ETH_ADDRESS } = require('../test/util/constants');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();
const appConfig = require('../src/config');

const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("./interface/ERC20.sol");

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;

contract('StablePayStorageGetExpectedRateTest', (accounts) => {
    const appConf = require('../config')(processArgs.network());

    // StablePay configuration
    const stablepayConf = appConf.stablepay;
    const stablepayContracts = stablepayConf.contracts;
    const stablepayProviders = stablepayConf.providers;

    // Kyber configuration
    const kyberConf = appConf.kyber;
    const kyberContracts = kyberConf.contracts;
    const kyberTokens = kyberConf.tokens;

    let providerRegistry;

    beforeEach('Deploying contract for each test', async () => {
        providerRegistry = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        assert(providerRegistry);
        assert(providerRegistry.address);
    });

    withData({
        _1_Kyber_1_ETH_to_DAI: [stablepayProviders.Kyber, "1", "ETH", "DAI", true],
        _2_Uniswap_1_ETH_to_DAI: [stablepayProviders.Uniswap, "1", "ETH", "DAI", false],
        _3_Kyber_100_KNC_to_DAI: [stablepayProviders.Kyber, "100", "KNC", "DAI", true],
        _4_Uniswap_100_KNC_to_DAI: [stablepayProviders.Uniswap, "100", "KNC", "DAI", false],
        _5_Uniswap_1_OMG_to_DAI: [stablepayProviders.Uniswap, "1", "OMG", "DAI", false],
        _6_Kyber_1_OMG_to_DAI: [stablepayProviders.Kyber, "1", "OMG", "DAI", true]
    }, function(providerKey, sourceAmountUnit, sourceTokenName, targetTokenName, isSupportedExpected) {
        it(t('anUser', 'getExpectedRate', `Should be able to get expected rate ${sourceAmountUnit} ${sourceTokenName} -> ${targetTokenName}.`), async function() {
            // Setup
            const sourceTokenAddress = kyberTokens[sourceTokenName];
            const targetTokenAddress = kyberTokens[targetTokenName];

            let sourceAmountWei = web3.utils.toWei(sourceAmountUnit, 'ether');
            if(sourceTokenAddress !== ETH_ADDRESS) {
                const sourceToken = await ERC20.at(sourceTokenAddress);
                const tokenDecimals = await sourceToken.decimals();
                const sourceAmount = new Amount(sourceAmountUnit, tokenDecimals);
                sourceAmountWei = sourceAmount.asWeisFixed(); 
            }

            // Invocation
            const result = await providerRegistry.getExpectedRate(
                providerKey,
                sourceTokenAddress,
                targetTokenAddress,
                sourceAmountWei
            );
            console.log(result);

            // Invocation
            assert(result);
            assert.equal(result.isSupported, isSupportedExpected); // It depends on the network.
        });
    });
});