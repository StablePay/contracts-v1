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
		StablePay: '0x3a0A6E37EFcA93042D422eb18A309d59d7754bBB',
		StablePayStorage: '0x68c77705E733c59AdD8FDE9532Cf2538aa7d4cc0',
		Settings: '0xd5eFd3D53278BE0Ea99EdE0620eB02bA9928ce9F',
		Vault: '0x9E4C7B36284EbB5E1319506278755D4972E15B24',
		KyberSwappingProvider: '0x821F119214fC8e4d483dd96789822d7Eb08D14De',
		UniswapSwappingProvider: '0x1EE12e2800Cd41CD8a093ED70D2448464E70c219',
		TransferToPostAction: '0x1478901EC12c46ef4dA442dD607C38BD45bE12D7',
		PostActionRegistry: '0xbFce1AB44DA8Ba9a08aEA90a0cC2F973bA2ba0E2',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
