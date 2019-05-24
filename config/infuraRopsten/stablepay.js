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
		StablePay: '0xa336eE7D97C82E43CE94770fE1B2D3dd184aE50F',
		StablePayStorage: '0x5d7767F5d9021143c22a26d98912aDC6bE7A0e9f',
		Settings: '0x970D80749e780D0b39d7b9f856423Bbae37f9912',
		Vault: '0x2850a55fbc7c9Bb2FDf6d27A280D8944AD5EC9f4',
		KyberSwappingProvider: '0x24B208FD7e696df1D0EcbC59c4c72af16CE8cf90'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
