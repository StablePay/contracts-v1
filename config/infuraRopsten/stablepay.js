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
		StablePay: '0xfb930aD64F1d1392DD46320328245E0E05600Fd5',
		StablePayStorage: '0x2990C11C4Ce88393342D88bCc7DF5Fb08feC5778',
		Settings: '0xcEA3533F75aBE706C3203E69560666cFa80f979e',
		Vault: '0xe89998AF8405939A6f42C1d61761743d51203bAa',
		KyberSwappingProvider: '0x2015e3428be2634C8cD24AeD53999cC8478C6903'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000'
	}
};
