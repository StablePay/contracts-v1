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
		StablePay: '0xD3fbDEa30117F7eeAC3f0103FfeE47b6541cFC93',
		StablePayStorage: '0x665E264E590A7F0BC0710C40C386251D5c3045e2',
		Settings: '0x0B2d2C339Ed6a66385462673bd435C85bD1f00bc',
		Vault: '0x0Ffd8E03802041E134dA0a3eE008D931065Bd81f',
		KyberSwappingProvider: '0x91b59621e554597dD313a2aC86D103DA2505D6E7'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000'
	}
};
