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
		},
		{
			name: 'WETH', // Used to send Ether to the receiver in a post action.
			minAmount: BigNumber("0.001").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("1").times(DECIMALS).toFixed()
		}
	],
	contracts: {
		StablePay: '0xD989951B665C577edB33a4bc33887fc3bF3f59B3',
		StablePayStorage: '0x3A34D4a61E66fDDfC22115F16Faa7B8e2d0C9484',
		Settings: '0x10AC843045230576152e33Ce86d49CC2815FB4D9',
		Vault: '0x5F92646B196e6ECe54cb726245B021efa654c800',
		KyberSwappingProvider: '0xe9FED93Fd9A1cD85796E99c18a6057164835444a',
		UniswapSwappingProvider: '0xa2AfA042047D38D22f7b1E8D590eACB43853ac5D',
		TransferToPostAction: '0x7Fd1D4103EcE806BdC149bA0d08982789F45D980',
		PostActionRegistry: '0x7bFE4f89ab5830aC72b9DFfC35828626F31112b8',
		Storage: '0x7afBd481f071c3D040ad982060cb46AAFB939099',
		Registration: '0xe1AA9c7dD3E9D82B254ed0B5a6c0C503A8D21007',
		CompoundSettings: '0x07Ec68711e4c3284362ff30FffC3F8E49f1a4Ca7',
		CompoundMintPostAction: '0xc4324BEeCE5a703f47Bd54AEDdD97e8c50F9BA81',
		EtherTransferPostAction: '0x228c41947D9af3E7ED261Ba75E0457511AB5F49b',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
