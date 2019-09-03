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
		StablePay: '0xD30b0F096CA3f79FE31ce392dC67d28326443814',
		StablePayStorage: '0x2BC5d062A3c03241c12957b6aaea31dAa1d4775E',
		Settings: '0xD7B86c8988Ca70FEb864fa8482d81B2330E546FD',
		Vault: '0x4812287d925262bb59d00Dde15B9fB9bCc43Df7B',
		KyberSwappingProvider: '0xf7757A4387a9be5F76c9EEf71662368c43A14203',
		UniswapSwappingProvider: '0xAB5b306754c79bC3a328191a8c65C7356906C307',
		TransferToPostAction: '0xb7A1Cee0Bbd6CE096De911472270B52dd3CfAe9F',
		PostActionRegistry: '0xcd956b3bFC5966D016Db8963FF88844c245E7D1a',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
