const Amount = require('../src/amounts/Amount');
const {
    ETH_ADDRESS,
    title: t,
} = require('../test/util/consts');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("openzeppelin-solidity/contracts/token/ERC20/IERC20.sol");

const leche = require('leche');
const withData = leche.withData;

contract('ProviderRegistryGetExpectedRateTest', (accounts) => {
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
        _1_Kyber_DAI_to_10_DAI: [stablepayProviders.Kyber, "DAI", '10', "DAI", true],
        _1_Uniswap_DAI_to_10_DAI: [stablepayProviders.Uniswap, "DAI", '10', "DAI", true],
        _2_Kyber_KNC_to_20_DAI: [stablepayProviders.Kyber, 'KNC', '20', 'DAI', true],
        _2_Uniswap_KNC_to_20_DAI: [stablepayProviders.Uniswap, 'KNC', '20', 'DAI', true],
        _3_Kyber_KNC_to_30_DAI: [stablepayProviders.Kyber, 'KNC', '30', 'DAI', true],
        _3_Uniswap_KNC_to_30_DAI: [stablepayProviders.Uniswap, 'KNC', '30', 'DAI', true],
        _4_Kyber_KNC_to_80_DAI: [stablepayProviders.Kyber, 'KNC', '80', 'DAI', true],
        _4_Uniswap_KNC_to_80_DAI: [stablepayProviders.Uniswap, 'KNC', '80', 'DAI', true],
        _5_Kyber_EOS_to_80_DAI: [stablepayProviders.Kyber, 'EOS', '25', 'DAI', true],
        _5_Uniswap_EOS_to_80_DAI: [stablepayProviders.Uniswap, 'EOS', '25', 'DAI', false],
        _6_Kyber_OMG_to_15_DAI: [stablepayProviders.Kyber, 'OMG', '15', 'DAI', true],
        _6_Uniswap_OMG_to_15_DAI: [stablepayProviders.Uniswap, 'OMG', '15', 'DAI', false],
        _7_Kyber_OMG_to_31_DAI: [stablepayProviders.Kyber, 'OMG', '31', 'DAI', true],
        _7_Uniswap_OMG_to_31_DAI: [stablepayProviders.Uniswap, 'OMG', '31', 'DAI', false],
        _8_Kyber_MANA_to_30_DAI: [stablepayProviders.Kyber, 'MANA', '30', 'DAI', true],
        _8_Uniswap_MANA_to_30_DAI: [stablepayProviders.Uniswap, 'MANA', '30', 'DAI', false],
        _9_Kyber_ZIL_to_25_DAI: [stablepayProviders.Kyber, 'ZIL', '25', 'DAI', true],
        _9_Uniswap_ZIL_to_25_DAI: [stablepayProviders.Uniswap, 'ZIL', '25', 'DAI', true],
        _10_Kyber_ELF_to_32_DAI: [stablepayProviders.Kyber, 'ELF', '32', 'DAI', true],
        _10_Uniswap_ELF_to_32_DAI: [stablepayProviders.Uniswap, 'ELF', '32', 'DAI', false],
        _11_Kyber_SNT_to_41_DAI: [stablepayProviders.Kyber, 'SNT', '41', 'DAI', true],
        _11_Uniswap_SNT_to_41_DAI: [stablepayProviders.Uniswap, 'SNT', '41', 'DAI', true],
        _12_Kyber_BAT_to_21_DAI: [stablepayProviders.Kyber, 'BAT', '21', 'DAI', true],
        _12_Uniswap_BAT_to_21_DAI: [stablepayProviders.Uniswap, 'BAT', '21', 'DAI', true],
        _13_Kyber_POWR_to_15_5_DAI: [stablepayProviders.Kyber, 'POWR', '15.5', 'DAI', true],
        _13_Uniswap_POWR_to_15_5_DAI: [stablepayProviders.Uniswap, 'POWR', '15.5', 'DAI', false],
        _14_Kyber_ETH_to_1_DAI: [stablepayProviders.Kyber, 'ETH', '1', 'DAI', true],
        _14_Uniswap_ETH_to_1_DAI: [stablepayProviders.Uniswap, 'ETH', '1', 'DAI', true],
        _15_Kyber_ETH_to_10_DAI: [stablepayProviders.Kyber, 'ETH', '10', 'DAI', true],
        _15_Uniswap_ETH_to_10_DAI: [stablepayProviders.Uniswap, 'ETH', '10', 'DAI', true],
        _16_Kyber_ETH_to_20_DAI: [stablepayProviders.Kyber, 'ETH', '20', 'DAI', true],
        _16_Uniswap_ETH_to_20_DAI: [stablepayProviders.Uniswap, 'ETH', '20', 'DAI', true],
        _17_Kyber_ETH_to_30_DAI: [stablepayProviders.Kyber, 'ETH', '30', 'DAI', true],
        _17_Uniswap_ETH_to_30_DAI: [stablepayProviders.Uniswap, 'ETH', '30', 'DAI', true],
        _18_Kyber_ETH_to_80_DAI: [stablepayProviders.Kyber, 'ETH', '80', 'DAI', true],
        _18_Uniswap_ETH_to_80_DAI: [stablepayProviders.Uniswap, 'ETH', '80', 'DAI', true],
        _19_Kyber_ETH_to_30_DAI: [stablepayProviders.Kyber, 'ETH', '30', 'DAI', true],
        _19_Uniswap_ETH_to_30_DAI: [stablepayProviders.Uniswap, 'ETH', '30', 'DAI', true],
        _20_Kyber_ETH_to_30_DAI: [stablepayProviders.Kyber, 'ETH', '30', 'DAI', true],
        _20_Uniswap_ETH_to_30_DAI: [stablepayProviders.Uniswap, 'ETH', '30', 'DAI', true],
        _21_Kyber_ETH_to_30_DAI: [stablepayProviders.Kyber, 'ETH', '12', 'DAI', true],
        _21_Uniswap_ETH_to_30_DAI: [stablepayProviders.Uniswap, 'ETH', '12', 'DAI', true],
        _22_Kyber_ETH_to_10_DAI: [stablepayProviders.Kyber, 'ETH', '29.98', 'DAI', true],
        _22_Uniswap_ETH_to_10_DAI: [stablepayProviders.Uniswap, 'ETH', '29.98', 'DAI', true],
        _23_Kyber_DAI_to_1_ETH: [stablepayProviders.Kyber, 'DAI', '1', 'ETH', true],
        _23_Uniswap_DAI_to_1_ETH: [stablepayProviders.Uniswap, 'DAI', '1', 'ETH', true],
    }, function(providerKey, sourceTokenName, targetAmountUnit, targetTokenName, isSupportedExpected) {
        it(t('anUser', 'getExpectedRate', `Should be able to get expected rate for: ${sourceTokenName} -> ${targetAmountUnit} ${targetTokenName}.`), async function() {
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
            const result = await providerRegistry.getExpectedRate(
                providerKey,
                sourceTokenAddress,
                targetTokenAddress,
                targetAmountWei
            );

            // Invocation
            assert(result);
            assert.equal(result.isSupported, isSupportedExpected); // It depends on the network.
        });
    });
});