const BigNumber = require('bignumber.js');
const DECIMALS = (new BigNumber(10)).pow(18);

module.exports = {
	targetTokens: [
		{
			name: 'DAI',
			minAmount: BigNumber("0").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("5").times(DECIMALS).toFixed()
		}
	]
};
