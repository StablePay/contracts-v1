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
		StablePay: '0x563E122b1a5fa934bd0c0227d0219605d037a83B',
		StablePayStorage: '0x94fa3Fd7a58f37d8B722fa4FE9677d1186a864A0',
		Settings: '0xC2E47a6a28Bf8d621b7CdA7843Af574B28909Ee8',
		Vault: '0x48F83b0e85132a6ad6532F3DcEB157c780Ee5D1F',
		KyberSwappingProvider: '0x7A4f0EFa506EAf07Ed2D9AC3AFA268b04Be21cad',
		UniswapSwappingProvider: '0x4E6fE0F1a137D521F3492Eb60F4e53840A7292B2',
		TransferToPostAction: '0x3a6be2d2c1304B39f7E506c713504Ecb68eDC61A',
		PostActionRegistry: '0x270798763560e23CaB2666DE1D12224AD5d67E82',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
