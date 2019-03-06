const TokenPairAccountBalances = require('./TokenPairAccountBalances');

class PairBalancesResult {
    constructor() {
        this.pairBalances = [];
    }
}

PairBalancesResult.prototype.addPairBalance = function(pairBalance) {
    this.pairBalances.push(pairBalance);
}

PairBalancesResult.prototype.getBalance = function(name, tokenInstance) {
    for (const pairBalance of this.pairBalances) {
        const hasTokenAddress = pairBalance.hasTokenAddress(tokenInstance.address);
        const hasName = pairBalance.hasName(name);
        if(hasTokenAddress && hasName) { //TokenPairAccountBalances
            return pairBalance;
        }
    }
    return undefined;
}

PairBalancesResult.prototype.getBalance = function(name, tokenInstance) {
    for (const pairBalance of this.pairBalances) {
        const hasTokenAddress = pairBalance.hasTokenAddress(tokenInstance.address);
        const hasName = pairBalance.hasName(name);
        if(hasTokenAddress && hasName) { //TokenPairAccountBalances
            return pairBalance;
        }
    }
    return undefined;
}

module.exports = PairBalancesResult;