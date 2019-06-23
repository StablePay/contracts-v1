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
		StablePay: '0x1925e792C8422834D8B910aF6711413b92a60F49',
		StablePayStorage: '0xA3dF3716F825ec5ac6C5006A31D9AD3Cb3D11740',
		Settings: '0x6900336e64202A60B61Ed3908db6955dd4529F34',
		Vault: '0xcF2966534AfBb286B75AF73b39f83c5DD5D84c25',
		KyberSwappingProvider: '0xb253c04Db862B17461FEe8652546709b8d1aA432',
		UniswapSwappingProvider: '0x0bBEF7c549DF3Ca7f7D91312c24cE17b29e0Ee5e'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
