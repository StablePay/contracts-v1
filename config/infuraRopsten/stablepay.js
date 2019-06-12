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
		StablePay: '0x5932C7cEAbdf0Cbe8ABeb620F788FCF2B6D41578',
		StablePayStorage: '0x648CeeD85C01761b5E9ffA0cc1629D82b9d6D61E',
		Settings: '0x2b2c0B5a4df05555641aa0c26ddA16193e4d3634',
		Vault: '0x90b2eC23dF1459d2d56090311DF6D5991E2Ca9e5',
		KyberSwappingProvider: '0xc25d4383Ae1a9c248318e6d2977dfB59915A91Ea'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
