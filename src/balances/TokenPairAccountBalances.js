const BigNumber = require('bignumber.js');

class TokenPairAccountBalances {
    constructor(name, address, tokenAddress, leftAliasBalanceWei, rightAliasBalanceWei) {
        this.name = name;
        this.address = address;
        this.tokenAddress = tokenAddress;
        this.leftAliasBalanceWei = leftAliasBalanceWei;
        this.rightAliasBalanceWei = rightAliasBalanceWei;
    }
}

TokenPairAccountBalances.prototype.toString = function() {
    const sourceAmountWeis = this.leftAliasBalanceWei.toString();
    const targetAmountWeis = this.rightAliasBalanceWei.toString();
    return `${this.name} (${this.address}) : Token (${this.tokenAddress}) ${sourceAmountWeis} => ${targetAmountWeis} = ${this.minusString()}`;
}

TokenPairAccountBalances.prototype.hasTokenAddress = function(tokenAddress) {
    return this.tokenAddress.toUpperCase() === tokenAddress.toUpperCase();
}

TokenPairAccountBalances.prototype.hasName = function(name) {
    return this.name.toUpperCase() === name.toUpperCase();
}

TokenPairAccountBalances.prototype.minus = function() {
    const leftBigNumber = BigNumber(this.leftAliasBalanceWei.toString());
    const rightBigNumber = BigNumber(this.rightAliasBalanceWei.toString());
    return leftBigNumber.minus(rightBigNumber);
}

TokenPairAccountBalances.prototype.minusString = function() {
    const minusBigNumber = this.minus();
    return minusBigNumber.toString();
}

TokenPairAccountBalances.prototype.isMinusEquals = function(value) {
    const minusResult = this.minusString();
    return minusResult === value.toString();
}

module.exports = TokenPairAccountBalances;