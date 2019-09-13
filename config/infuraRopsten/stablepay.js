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
		StablePay: '0x85F624020f1825cD1857a85a7420448f785760Df',
		StablePayStorage: '0xE40b4FB5463C295e3b46e39618B8C336957741a6',
		Settings: '0x9f6330fCe082fDe61cf6763852FED606AB22a12F',
		Vault: '0x9E4b8Df56F6F2219c5489226A04f997f6c7b2686',
		KyberSwappingProvider: '0x0C0456DEDbf6038956d7dEB427669eb74029957F',
		UniswapSwappingProvider: '0x071b11a8c0d8B0f598aE0FaB1821cFe825828A86',
		TransferToPostAction: '0x68db4f5e4dB17e2f2D6ba3DA21b9020ae69F48ee',
		PostActionRegistry: '0xfFD4aB068A7cd4987e449afF602a6B9880558CF2',
		Storage: '0x1544Dfec7022EC7C57c5A512b1151ED236DdbcBc',
		Registration: '0xcDDF19727580e8c4BCC5d5a9a982B252A2ABBB8D',
		CompoundSettings: '0x237be492336a6D44a1C8eF5D5048f8947eb907df',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
