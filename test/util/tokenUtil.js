const { 
    BigNumber
} = require('0x.js');
const {
    Web3Wrapper
} = require('@0xproject/web3-wrapper');
const {
    DECIMALS
} =  require('./constants');

const toBaseUnitAmount = (amount, decimals = DECIMALS) => {
    return Web3Wrapper.toBaseUnitAmount(new BigNumber(amount), decimals);
}

const toUnitAmount = (amount, decimals = DECIMALS) => {
    return Web3Wrapper.toUnitAmount(new BigNumber(amount), decimals);
}

const toWei = (amount) => {
    return Web3Wrapper.toWei(new BigNumber(amount));
}

module.exports = {
    toBaseUnitAmount,
    toUnitAmount,
    toWei
}