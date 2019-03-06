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
		StablePay: '0x57c3F9D35252e9678c865D76aFF51a070aBC0417',
		StablePayStorage: '0xE15112177A8e2b57C2cAf6a989ACdD3592183914',
		Settings: '0x5C2642a9Ba20E0C8548730985F788ff8Bd96dAE8',
		Vault: '0x6bbB103cEf482518C8bcf3182c00B3B5036acD42',
		KyberSwappingProvider: '0x3781acc49714cabdc343E333485991Bf854cB312'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000'
	}
};
