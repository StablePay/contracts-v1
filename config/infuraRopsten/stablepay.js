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
		StablePay: '0x1B5431F92A02619E2aC407F1b891400b0DF7f734',
		StablePayStorage: '0xF598483a3bD9f57aa45a0E8dD47F8b3E1Eef2B08',
		Settings: '0x4CFC95B8336Eb226A6b564dD163bC4E5aF4370a0',
		Vault: '0x2283Bddea5CA1C5C4543451d77084D237a2FaBCF',
		KyberSwappingProvider: '0x943D59b9AA6D4F601E10190543E98c9dD7460Cd1',
		UniswapSwappingProvider: '0x806d80E185eC4cF8f304a8ea714989A0AaBe80ae',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
