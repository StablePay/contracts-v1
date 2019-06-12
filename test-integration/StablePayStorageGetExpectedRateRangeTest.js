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

contract('StablePayStorageGetExpectedRateRangeTest', (accounts) => {
    const appConf = require('../config')(processArgs.network());

    // StablePay configuration
    const stablepayConf = appConf.stablepay;
    const stablepayContracts = stablepayConf.contracts;
    const stablepayProviders = stablepayConf.providers;

    // Kyber configuration
    const kyberConf = appConf.kyber;
    const kyberTokens = kyberConf.tokens;

    let providerRegistry;

    beforeEach('Deploying contract for each test', async () => {
        providerRegistry = await IProviderRegistry.at(stablepayContracts.StablePayStorage);
        assert(providerRegistry);
        assert(providerRegistry.address);
    });

    withData({
        _1_1_ETH_to_DAI: ["1", "ETH", "DAI"],
        _2_1_KNC_to_DAI: ["1", "KNC", "DAI"],
        _3_1_DAI_to_DAI: ["1", "DAI", "DAI"],
        _4_1_OMG_to_DAI: ["1", "OMG", "DAI"],
        _5_1_OMG_to_DAI: ["1", "MANA", "DAI"]
    }, function(sourceAmountUnit, sourceTokenName, targetTokenName) {
        it(t('anUser', 'getExpectedRateRange', `Should be able to get expected rate range ${sourceAmountUnit} ${sourceTokenName} -> ${targetTokenName}.`), async function() {
            // Setup
            const targetTokenAddress = kyberTokens[targetTokenName];
            const sourceTokenAddress = kyberTokens[sourceTokenName];
            let sourceAmountWei = web3.utils.toWei(sourceAmountUnit, 'ether');
            if(sourceTokenAddress !== ETH_ADDRESS) {
                const sourceToken = await ERC20.at(sourceTokenAddress);
                const tokenDecimals = await sourceToken.decimals();
                const sourceAmount = new Amount(sourceAmountUnit, tokenDecimals);
                sourceAmountWei = sourceAmount.asWeisFixed();
            }

            // Invocation
            const result = await providerRegistry.getExpectedRateRange(
                sourceTokenAddress,
                targetTokenAddress,
                sourceAmountWei
            );
            console.log(result);

            // Invocation
            assert(result.minRate > 0);
            assert(result.maxRate > 0);
        });
    });
});