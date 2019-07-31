const Web3 = require('web3');

class Erc20Balances {
    constructor(tokenAddress) {
        this.tokenAddress = tokenAddress;
        this.balances = new Map();
    }
}

Erc20Balances.prototype.saveBalance = function(alias, balance) {
    this.balances.set(alias, balance);
}

Erc20Balances.prototype.hasTokenAddress = function(tokenAddress) {
    return this.tokenAddress.toLowerCase() === tokenAddress.toLowerCase();
}

Erc20Balances.prototype.getBalanceEther = function(alias) {
    const aliasBalance = this.getBalanceWei(alias);
    return Web3.utils.fromWei(aliasBalance, 'ether');
}

Erc20Balances.prototype.getBalanceWei = function(alias) {
    return this.balances.get(alias) || "0";
}

module.exports = Erc20Balances;