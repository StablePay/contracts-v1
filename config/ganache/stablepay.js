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
    ]
};
