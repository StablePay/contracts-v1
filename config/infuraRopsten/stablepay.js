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
		StablePay: '0x4d46bf6563F36C95Db8b89ba596d8caee9Dc1913',
		StablePayStorage: '0xFC0b012eABF38B3c25e9a4228FC51a6fFFeaDbA1',
		Settings: '0xbB78916279Aa196FE3b62d24D45d3D229DBd7a38',
		Vault: '0xE710C4e2B70b770fd22730C85A5Da743d1DF34c3',
		KyberSwappingProvider: '0x1674d4CD5B9AAd1ccc9B1d7d03947f293c5F3071',
		UniswapSwappingProvider: '0x843a3446c79DEB1e9B5f3017d85B32A2E44c685C',
		TransferToPostAction: '0xBbbd256A47633ee9425763eB8E68A410eD087e37',
		PostActionRegistry: '0xD1273108B59f25d16c470400C73eD283a7858b25',
		Storage: '0x4D01C7C2cf428bDE1AcDF4160Ce2b5cF9F0E0bBE',
		Registration: '0xCf9F05d2aA0f75324F758c355F300B8Cb17f48c8',
		CompoundSettings: '0xF655Bc4eeEff58167F5eaAD80A9D37F23C851d79',
		CompoundMintPostAction: '0xb433B5497b03AEAF4A10dbF4A9e720FE6c4c3302',
		EtherTransferPostAction: '0x614C3444E748be255372D14D1952bC23cAC0D06d',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
