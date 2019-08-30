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
		StablePay: '0x7D5fb81d45BEE90086C80f43676C0ee044c25E85',
		StablePayStorage: '0x41bf906fF970Dd5B87491d59bF46EA3102C6b932',
		Settings: '0x5D4B623B523Dc89AcaDC8D695149C375D9594769',
		Vault: '0xAc82F368c7676dCCFd42a2bE71AA928059033fd2',
		KyberSwappingProvider: '0xCf732e757cCb1953C1fD47FBB0410c0487488D8C',
		UniswapSwappingProvider: '0x82Af1EC030EAAfC62Da00b1DB1F8491fe0c9d182',
		TransferToPostAction: '0x2547B05849501d2BF088A0B0E3486D4788a9Ba29',
		PostActionRegistry: '0xE387f8b0A877D6ab0b935511d01de20fa7ecE122',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
