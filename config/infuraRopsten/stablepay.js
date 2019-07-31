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
		StablePay: '0xE2309FbcC7Dffac163E177db6184b14B09f7b0C9',
		StablePayStorage: '0x091125c1eD0E1C2cAA9AC6c98864bc8bC92C3114',
		Settings: '0xbE7c5318e7423364CD0A7dDAC069a8163Faf7350',
		Vault: '0xE448f25F06E00800CBb0E98A468881Dcb8cF729b',
		KyberSwappingProvider: '0x8902131c1066b9890e39ec32cB76B021CA295D07',
		UniswapSwappingProvider: '0x9b04778C455ee800367673fC8988788a7706b6fa',
		TransferToPostAction: '0x9dcef3037E7E8d3E45755D48FD63243Da0023064',
		PostActionRegistry: '0x468842B9680b891E204F71cB5cB3770320990755',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
