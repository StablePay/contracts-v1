const BigNumber = require('bignumber.js');
const DECIMALS = (new BigNumber(10)).pow(18);

module.exports = {
	targetTokens: [
		{
			name: 'DAI',
			minAmount: BigNumber("10").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("100").times(DECIMALS).toFixed()
		}
	],
	contracts: {
		StablePay: '0xFeD02d9b32e6C2eeeB78977Ffa48a7cB811F678e',
		StablePayStorage: '0xA30d13E51CC8905678C5016792CF22D4F49bFE5A',
		Settings: '0xaF080988D2b19805073D74B6Ae0a959c5dBF6C37',
		Vault: '0x6c5A85E58C291A754523d090484CB629E13D05f2',
		KyberSwappingProvider: '0x4ADb1c1fa34c0E7904ba6C5Cff2827beC6e9A19F'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
