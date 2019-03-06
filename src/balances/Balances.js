const AccountBalances = require('./AccountBalances');
const PairBalancesResult = require('./PairBalancesResult');

class Balances {
    constructor(verbose = false) {
        this.balances = [];
        this.verbose = verbose;
    }
}

Balances.prototype.addAccount = function(name, address) {
    this.balances.push(new AccountBalances(name, address));
}

Balances.prototype.addAccounts = function(accounts) {
    for (const {name, address} of accounts) {
        this.addAccount(name, address);
    }
}

Balances.prototype.getAccount = function(name) {
    for (const accountBalances of this.balances) {
        if(accountBalances.hasName(name)) {
            return accountBalances;
        }
    }
    return undefined;
}

Balances.prototype.saveBalances = async function(alias, erc20Instances) {
    if(this.verbose) console.log(`Saving balances for alias '${alias}'.`);
    for (const accountBalances of this.balances) {
        if(this.verbose) console.log(`Account balances: Name: '${accountBalances.name}' - Address: ${accountBalances.address}.`);
        await accountBalances.saveBalances(alias, erc20Instances);
    }
}

Balances.prototype.getBalances = function(leftAlias, rigthAlias) {
    const result = new PairBalancesResult();
    for (const accountBalances of this.balances) {
        const accountPairBalances = accountBalances.getBalancesWei(leftAlias, rigthAlias);
        accountPairBalances.forEach(pairBalance => result.addPairBalance(pairBalance));
    }
    return result;
}

module.exports = Balances;