module.exports = {
    network: 'ganache',
	kyber: require('./kyber'),
    uniswap: require('./uniswap'),
    stablepay: require('./stablepay'),
    compound: require('./compound'),
    maxGas: 6000000,
};
