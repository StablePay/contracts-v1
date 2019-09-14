const BigNumber = require('bignumber.js');
const DAI_DECIMALS = (new BigNumber(10)).pow(18);

module.exports = {
    targetTokens: [
		{
			name: 'DAI',
			minAmount: BigNumber("0.001").times(DAI_DECIMALS).toFixed(),
			maxAmount: BigNumber("10").times(DAI_DECIMALS).toFixed()
		}
    ],
	contracts: {
		StablePay: '0x41Ded684254bA4F309d05A4997C200D11032582C',
		StablePayStorage: '0x13Aab54E805EA2998E45cE8a14eea02fCb65Cf11',
		Settings: '0x62AA1CBFaA53bda7a13cFF8d516848B4bF40dCB0',
		Vault: '0x4E1e29DC6a673965820761d7c9F3FdBC790F5541',
		KyberSwappingProvider: '0xED9C103c60527D29246361713e944B2c04F3dFe7',
		UniswapSwappingProvider: '0x171d179A0Ce381ff48Da5C082786DAddf139E153',
		TransferToPostAction: '0xd24927221B82B1b62ed7560027786A2eBFE1ba29',
		PostActionRegistry: '0x5ca371178A278b596CC4B4F6F59F8552D62B849b',
		Storage: '0x346DE60Bbd1265E5553fD77F94bEf67788e266cd',
		Registration: '0x9de6242F5211F111148bAC5A4FB1bb6b3Af1928e',
		CompoundSettings: '0x6D1Fe7e8A3B010A65f3e0540112dCC1a954E8C99',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
