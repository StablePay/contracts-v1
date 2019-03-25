const _0x = require('./0x');
const kyber = require('./kyber');

module.exports = {
    network: 'kovan',
    zerox: _0x,
	kyber: kyber,
    uniswap: require('./uniswap'),
    stablepay: require('./stablepay')
};
