const BigNumber = require('bignumber.js');
const DECIMALS = (new BigNumber(10)).pow(18);

module.exports = {
    targetTokens: [
        {
            name: 'KNC',
            minAmount: BigNumber("10").times(DECIMALS).toFixed(),
            maxAmount: BigNumber("10000").times(DECIMALS).toFixed()
        },
        {
            name: 'OMG',
            minAmount: BigNumber("11").times(DECIMALS).toFixed(),
            maxAmount: BigNumber("10001").times(DECIMALS).toFixed()
        },
        {
            name: 'SALT',
            minAmount: BigNumber("12").times(DECIMALS).toFixed(),
            maxAmount: BigNumber("10002").times(DECIMALS).toFixed()
        },
        {
            name: 'ZIL',
            minAmount: BigNumber("13").times(DECIMALS).toFixed(),
            maxAmount: BigNumber("10003").times(DECIMALS).toFixed()
        },
        {
            name: 'MANA',
            minAmount: BigNumber("14").times(DECIMALS).toFixed(),
            maxAmount: BigNumber("10004").times(DECIMALS).toFixed()
        }
    ],
	contracts: {
		StablePay: '0x5C9A7F4Df389240acC026832BE4135a5461690A7',
		StablePayStorage: '0xd155040d6332dDdFcC107f89BF74429f3C41A8D1',
		Settings: '0x6E0b96360A2bb8C43B204B7805a2E7c34E87b8f8',
		Vault: '0x0456236E3477BC66909E92e8fBDdF1CdcC605122',
		KyberSwappingProvider: '0x2d0805563a70ff7E0e7E3dD0Bb5dc5e644ED8241'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000'
	}
};
