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
		StablePay: '0xE70D977E951EBAd73ffa0C67Fd5E5C44caD30EA9',
		StablePayStorage: '0x1f545C495ecc5d0515edf3c5B8D7593f2d03d439',
		Settings: '0x7bbc3ccb9388d0Dc22C16c3c3f08058629405DC9',
		Vault: '0x58d02807916DbBe89cFD78C6cFDF3f628178c4E4',
		KyberSwappingProvider: '0x908d76B66374CC30655f91d9Ad00f68A85EC351C'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
