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
        StablePay: '0x404333c507d0f60AD8bcCB845A2c9D439d96fb1E',
        StablePayStorage: '0x56B1C845Dc3FeBf9F727629C36929Aa3B76e9CcA'
    },
    providers: {
        Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
        ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000'
    }
};
