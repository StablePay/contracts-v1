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
		},
		{
			name: 'WETH', // Used to send Ether to the receiver in a post action.
			minAmount: BigNumber("0.001").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("1").times(DECIMALS).toFixed()
		}
	],
	contracts: {
		StablePay: '0xBa318A1fbb2f3093DF31134C42730fDaAe753252',
		StablePayStorage: '0x98D515Db67b3ea758c57bb5d48c51B7c14126256',
		Settings: '0xac9311f2a326beF5b4ed087EEfAb72279cC39f46',
		Vault: '0x1152cC566aC53Af2b8Fe9e3c7FA2a66Ca2D9B83D',
		KyberSwappingProvider: '0x9220e22Bf7e5DDE3DD3a5c1D2E5D2bEBaf6DBb15',
		UniswapSwappingProvider: '0xFaBc0f81e0b6D74f6A525Cee4329d1aDE178B0bb',
		TransferToPostAction: '0xcfa4BC41ab1CcE3B0F09EBe8072337f2928E5BBF',
		PostActionRegistry: '0xe844d377ae2C4EC04464C6491a25875Aa939614A',
		Storage: '0xdEd6587465E1F19396241Cfda114069E0D38bF1C',
		Registration: '0x9ab68F8c71BE836C2D34A04Fdd6d79A93CEa0A33',
		CompoundSettings: '0x9aeC9273EAC87Ee0c7bB98A785dC52Bf5d0EbD78',
		CompoundMintPostAction: '0x13e04C884744A7CFcbf9981F948cF74d6b4C9124',
		EtherTransferPostAction: '0x5A6A24CF42961Ec77ff9c5eE10F3b8e40332C341',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
