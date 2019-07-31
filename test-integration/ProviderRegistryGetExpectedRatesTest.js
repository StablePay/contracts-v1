const Amount = require('../src/amounts/Amount');
const {
    ETH_ADDRESS,
    title: t,
} = require('../test/util/consts');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("./interface/ERC20.sol");

const leche = require('leche');
const withData = leche.withData;

contract('ProviderRegistryGetExpectedRatesTest', (accounts) => {
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
        _1_DAI_to_10_DAI: ["DAI", '10', "DAI", 2],
        _2_KNC_to_20_DAI: ['KNC', '20', 'DAI', 2],
        _3_KNC_to_30_DAI: ['KNC', '30', 'DAI', 2],
        _4_KNC_to_80_DAI: ['KNC', '80', 'DAI', 2],
        _5_EOS_to_80_DAI: ['EOS', '25', 'DAI', 1],
        _6_OMG_to_15_DAI: ['OMG', '15', 'DAI', 1],
        _7_OMG_to_31_DAI: ['OMG', '31', 'DAI', 1],
        _8_MANA_to_30_DAI: ['MANA', '30', 'DAI', 1],
        _9_ZIL_to_25_DAI: ['ZIL', '25', 'DAI', 2],
        _10_ELF_to_32_DAI: ['ELF', '32', 'DAI', 1],
        _11_SNT_to_41_DAI: ['SNT', '41', 'DAI', 2],
        _12_BAT_to_21_DAI: ['BAT', '21', 'DAI', 2],
        _13_POWR_to_15_5_DAI: ['POWR', '15.5', 'DAI', 1],
        _14_ETH_to_1_DAI: ['ETH', '1', 'DAI', 2],
        _15_ETH_to_10_DAI: ['ETH', '10', 'DAI', 2],
        _16_ETH_to_20_DAI: ['ETH', '20', 'DAI', 2],
        _17_ETH_to_30_DAI: ['ETH', '30', 'DAI', 2],
        _18_ETH_to_80_DAI: ['ETH', '80', 'DAI', 2],
        _19_ETH_to_49_99_DAI: ['ETH', '49.99', 'DAI', 2],
        _20_ETH_to_47_25_DAI: ['ETH', '47.25', 'DAI', 2],
        _21_ETH_to_12_DAI: ['ETH', '12', 'DAI', 2],
        _22_ETH_to_29_98_DAI: ['ETH', '29.98', 'DAI', 2],
        _23_DAI_to_1_ETH: ['DAI', '1', 'ETH', 2],
    }, function(sourceTokenName, targetAmountUnit, targetTokenName, lengthExpected) {
        it(t('anUser', 'getExpectedRates', `Should be able to get expected rate for: ${sourceTokenName} -> ${targetAmountUnit} ${targetTokenName}.`), async function() {
            // Setup
            const sourceTokenAddress = kyberTokens[sourceTokenName];
            const targetTokenAddress = kyberTokens[targetTokenName];

            let targetAmountWei = web3.utils.toWei(targetAmountUnit, 'ether');
            if(sourceTokenAddress !== ETH_ADDRESS) {
                const sourceToken = await ERC20.at(sourceTokenAddress);
                const tokenDecimals = await sourceToken.decimals();
                const sourceAmount = new Amount(targetAmountUnit, tokenDecimals);
                targetAmountWei = sourceAmount.asWeisFixed(); 
            }

            // Invocation
            const result = await providerRegistry.getExpectedRates(
                sourceTokenAddress,
                targetTokenAddress,
                targetAmountWei
            );

            // Invocation
            assert(result);
            assert.equal(result.length, lengthExpected);
        });
    });
});