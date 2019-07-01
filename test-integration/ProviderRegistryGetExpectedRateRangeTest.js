const Amount = require('../src/amounts/Amount');
const { ETH_ADDRESS } = require('../test/util/constants');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("./interface/ERC20.sol");

const leche = require('leche');
const withData = leche.withData;
const t = require('../test/util/TestUtil').title;

contract('ProviderRegistryExpectedRateRangeTest', (accounts) => {
    const appConf = require('../config')(processArgs.network());

    // StablePay configuration
    const stablepayConf = appConf.stablepay;
    const stablepayContracts = stablepayConf.contracts;

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
        _1_DAI_to_10_DAI: ["DAI", '10', "DAI"],
        _2_KNC_to_20_DAI: ['KNC', '20', 'DAI'],
        _3_KNC_to_30_DAI: ['KNC', '30', 'DAI'],
        _4_KNC_to_80_DAI: ['KNC', '80', 'DAI'],
        _5_EOS_to_80_DAI: ['EOS', '25', 'DAI'],
        _6_OMG_to_15_DAI: ['OMG', '15', 'DAI'],
        _7_OMG_to_31_DAI: ['OMG', '31', 'DAI'],
        _8_MANA_to_30_DAI: ['MANA', '30', 'DAI'],
        _9_ZIL_to_25_DAI: ['ZIL', '25', 'DAI'],
        _10_ELF_to_32_DAI: ['ELF', '32', 'DAI'],
        _11_SNT_to_41_DAI: ['SNT', '41', 'DAI'],
        _12_BAT_to_21_DAI: ['BAT', '21', 'DAI'],
        _13_POWR_to_15_5_DAI: ['POWR', '15.5', 'DAI'],
        _14_ETH_to_1_DAI: ['ETH', '1', 'DAI'],
        _15_ETH_to_10_DAI: ['ETH', '10', 'DAI'],
        _16_ETH_to_20_DAI: ['ETH', '20', 'DAI'],
        _17_ETH_to_30_DAI: ['ETH', '30', 'DAI'],
        _18_ETH_to_80_DAI: ['ETH', '80', 'DAI'],
        _19_ETH_to_30_DAI: ['ETH', '30', 'DAI'],
        _20_ETH_to_30_DAI: ['ETH', '30', 'DAI'],
        _21_ETH_to_30_DAI: ['ETH', '12', 'DAI'],
        _22_ETH_to_10_DAI: ['ETH', '29.98', 'DAI'],
    }, function(sourceTokenName, targetAmountUnit, targetTokenName) {
        it(t('anUser', 'getExpectedRateRange', `Should be able to get expected rate range ${sourceTokenName} -> ${targetAmountUnit} ${targetTokenName}.`), async function() {
            // Setup
            const targetTokenAddress = kyberTokens[targetTokenName];
            const sourceTokenAddress = kyberTokens[sourceTokenName];
            let targetAmountWei = web3.utils.toWei(targetAmountUnit, 'ether');
            if(sourceTokenAddress !== ETH_ADDRESS) {
                const sourceToken = await ERC20.at(sourceTokenAddress);
                const tokenDecimals = await sourceToken.decimals();
                const sourceAmount = new Amount(targetAmountUnit, tokenDecimals);
                targetAmountWei = sourceAmount.asWeisFixed();
            }

            // Invocation
            const result = await providerRegistry.getExpectedRateRange(
                sourceTokenAddress,
                targetTokenAddress,
                targetAmountWei
            );

            // Invocation
            assert(result.minRate >= 0);
            assert(result.maxRate >= 0);
        });
    });
});