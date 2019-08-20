module.exports = {
    network: 'coverage',
    kyber: require('./kyber'),
    uniswap: require('./uniswap'),
    stablepay: require('./stablepay'),
    compound: require('./compound'),
    maxGas: 40000000,
};
