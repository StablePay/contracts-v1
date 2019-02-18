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
		StablePay: '0x404333c507d0f60AD8bcCB845A2c9D439d96fb1E',
		StablePayStorage: '0x56B1C845Dc3FeBf9F727629C36929Aa3B76e9CcA',
		Settings: '0xd33827e9D8b0401AF9C88c0C7054ee27A94F1BB8',
		Vault: '0x9Af37AD24232A5b56Fd223D352e881a41d309Cb8',
		KyberSwappingProvider: '0x63B46fDdD6Ddf0d785ECa5Bad5D53ec8210D9Bf3',
		StablePayStorage: '0x56B1C845Dc3FeBf9F727629C36929Aa3B76e9CcA'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000'
	}
};
