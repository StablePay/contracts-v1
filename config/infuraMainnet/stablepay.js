module.exports = {
    targetTokens: [
        {
            name: 'ETH',
            minAmount: 0,
            maxAmount: 2
        },
        {
            name: 'DAI',
            minAmount: 10,
            maxAmount: 100
        }
    ],
	contracts: {
		StablePay: '0xB7BcE08Ba466e044366ecFcA17a949657AF893Db',
		StablePayStorage: '0x2981F8bFd83ab4d3eC1Dfc8f0E5eD64fE67dEA63',
		Settings: '0xc579b778E5eb81b6506526D32f0635789794e48d',
		Vault: '0x9d348A4A666f73C1013c0416923d330F4aE0ACf8',
		KyberSwappingProvider: '0x99ca104eeD186c386030A3C675270b71fD053403'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
