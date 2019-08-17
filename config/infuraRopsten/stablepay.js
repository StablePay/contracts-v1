const BigNumber = require('bignumber.js');
const DECIMALS = (new BigNumber(10)).pow(18);

module.exports = {
	targetTokens: [
		{
			name: 'DAI',
			minAmount: BigNumber("10").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("100").times(DECIMALS).toFixed()
		},
		{
			name: 'DAI_COMPOUND', // To test Compound.finance Post Action 
			minAmount: BigNumber("10").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("100").times(DECIMALS).toFixed()
		}
	],
	contracts: {
		StablePay: '0x40FA0A33c4fd70de79b7C9E9eA2aA8B61367ea5e',
		StablePayStorage: '0x709d47d7f628f0112DeF0CEE69eD11aee3126FDB',
		Settings: '0x6519BD90C1893f1b491faed395b0483033d783ff',
		Vault: '0x2753F9763988EA793F939Bc85110b7B0F9Ad5cE1',
		KyberSwappingProvider: '0x56f2782D8877482060ed5bC18D7c540D6C0E5b00',
		UniswapSwappingProvider: '0x76627627C0eAc701974DC97253Cf48E264f612d7',
		TransferToPostAction: '0xd4511450eEf39FCB57e0df8bBF213c6da8693f0e',
		PostActionRegistry: '0xCBBF788468db55cF8c24cf7df644ae20A1990674',
		Storage: '0x568da7ecF8220c1B389aD583a542C44d20D493AC',
		Registration: '0x35F9c526Cd1cD7A88dA57DDED15C3130242BD316',
		CompoundSettings: '0x2b7ab08ddcb927f4DE6ce934eEF2268c933A6d1E',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
