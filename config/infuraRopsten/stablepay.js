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
		StablePay: '0x513F2D9a5907f965b318D892796b50422eCBFD18',
		StablePayStorage: '0xDA6d869782B45f90074F51F2F3A3f935a9c1D476',
		Settings: '0x38D096e5e883035D84eEf62E80e23A706DC29B8A',
		Vault: '0x40c687c453d1376B1Af7FaA5A168903354EB15E7',
		KyberSwappingProvider: '0xfa99d15863be580dfa537d6C469c8e1D255073c9'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
