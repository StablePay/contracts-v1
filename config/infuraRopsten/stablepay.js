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
		StablePay: '0xC07C33e440CD7b3D0f3b9E1eB99276AabBc94137',
		StablePayStorage: '0x178124226F1d02A786F9bb6b478361A95F017Cf9',
		Settings: '0x6414BB3a3Cd9b38593645c4D7beC07E0058e7C75',
		Vault: '0x2214C55CFCB8660c8bDfed9c74196CbC3fD13805',
		KyberSwappingProvider: '0x9a471405bCa13435F4db351FE5aB44B0054F299D',
		UniswapSwappingProvider: '0x293AFF3Ef868b216BeCDfD8bC9c2F43F5C24EDE4',
		TransferToPostAction: '0xc0C419b3f671d607d6C30492D2bd608AF015e2A3',
		PostActionRegistry: '0xcfCF62074923CF94DFA0F43e90DC2D2591b83bF3',
		Storage: '0xb773a8F43905E59E08882754C285E6a5FA221F79',
		Registration: '0x9Bd49a00e15BA809A434523B2C02BDcf1a933B8D',
		CompoundSettings: '0x060885d8240e69D1Cf92C5E7503094485F0F16d2',
		CompoundMintPostAction: '0x365013B24a29911751291B0481c09b49B2f3D3E3',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
