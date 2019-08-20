const BigNumber = require('bignumber.js');
const DECIMALS = (new BigNumber(10)).pow(18);

module.exports = {
	targetTokens: [
		{
			name: 'DAI',
			minAmount: BigNumber("10").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("100").times(DECIMALS).toFixed()
		},
		{
			name: 'DAI_COMPOUND', // To test Compound.finance Post Action 
			minAmount: BigNumber("10").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("100").times(DECIMALS).toFixed()
		}
	],
	contracts: {
		StablePay: '0xd77eaAB8519bB8228bFeC46d14b1AF9f204e0eeD',
		StablePayStorage: '0x4407Ad4CB5aFf8d1dB53A7061A0B849C5271aa89',
		Settings: '0xCbeFECc48dB2aadd4f1cBEe27E5c7dD72eB355a9',
		Vault: '0x4F67c3302E888Dd2e73EB087C743D4E6047E3A69',
		KyberSwappingProvider: '0xcAA41E385fbB3CBd8DD17C50200b757C1485DF14',
		UniswapSwappingProvider: '0x7B56C8BB58C0d9a422365F9F25e31344B3c4DF52',
		TransferToPostAction: '0x5f897dCd0761884C231f1151c7193cd14d6df7ce',
		PostActionRegistry: '0xe4030E479ceeb958a99DD9B50a82DdF25D10D4FC',
		Storage: '0x6F3d1A2c6a20D0C39ED77c2686bD3EF6851f139f',
		Registration: '0xaB24609f0f91983Be396AFc492F48293710a2778',
		CompoundSettings: '0x0D27048b090cFE0ED82f82e2a92f310c5deebC50',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
