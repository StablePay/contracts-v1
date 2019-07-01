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
		StablePay: '0xeb1366C0777383BBbbD1E4cA65003B7A6E576742',
		StablePayStorage: '0x9E527e631b4edbef9b4b85e4EfCa7702edC96B1c',
		Settings: '0xA65cBDd4C5EbD10D491ab50aA6680694FdC81f4c',
		Vault: '0x25Adf35525516d048f15edD6634Acf48a53fB25D',
		KyberSwappingProvider: '0x2AE885382aC2e3B970dBD4085A0f62918f67F012',
		UniswapSwappingProvider: '0xf178DE287813543925A0C5B9EcB80D299C153656'

	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
