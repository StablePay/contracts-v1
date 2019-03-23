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
		StablePay: '0x056a5d04dF585e9dfAc88e0b544066a988C214d2',
		StablePayStorage: '0x2612E8AF9861Ba3687818A823fb30D3c3f05Dbe6',
		Settings: '0x6B9fD65072309f1695Bce777DB4297fb1dE28cc9',
		Vault: '0x440D35eE59Bf202e1456C0f98CbA0fe02cf93Cdb',
		KyberSwappingProvider: '0x5Ce55BDaEcb72BD936763a255c06C5055c41a821'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000'
	}
};
