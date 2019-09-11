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
		StablePay: '0xe9246505DF757Ff82Fb44B8419Af6ffd68cfB240',
		StablePayStorage: '0x815107605c582eB0CebDA6fB74dF08474235fd26',
		Settings: '0xDBd7f5631831EEe1be381a6B8730401FB0810bD1',
		Vault: '0xDd5a43f6550af1766440f3789a9a75789A03D121',
		KyberSwappingProvider: '0x5Ae7Cbd8481Eb3c463b3894F5b9ba5B218D7DBe0',
		UniswapSwappingProvider: '0xE06438f6B62fB4F0dd89fbf18bC276AC3EA4205d',
		TransferToPostAction: '0x20E3D6a8A78577B37a11a9559e38e4E786D06f0d',
		PostActionRegistry: '0xae252afC32B1b8b1dC5fC604d5948E6D6fd49520',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
