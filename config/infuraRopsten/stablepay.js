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
		StablePay: '0xD649d6b5A6A97d6777d2317030a6680C0f5c7ef0',
		StablePayStorage: '0x423d6446573C8AB165b9971260e1030F7a61769D',
		Settings: '0xBfbcc071C89840C4C76595DD9550153Aaa5981f6',
		Vault: '0x8a495eaBce7c1e12efdFe37406d9d7e1c6b14900',
		KyberSwappingProvider: '0x0330b070eba682bC2A8a3537776B70dE10926856'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
