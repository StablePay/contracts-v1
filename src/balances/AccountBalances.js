const Web3 = require('web3');
const Erc20Balances = require('./Erc20Balances');
const TokenPairAccountBalances = require('./TokenPairAccountBalances');

const testnet = 'https://ropsten.infura.io/';
const web3 = new Web3(new Web3.providers.HttpProvider(testnet));
//var balance = web3.eth.getBalance(walletAddress); //Will give value in.
//balance = web3.toDecimal(balance);
const ETH = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';

class AccountBalances {
    constructor(name, address, verbose = false) {
        this.name = name;
        this.address = address;
        this.erc20Balances = [];
        this.verbose = verbose;
    }
}

AccountBalances.prototype.hasName = function(name) {
    return this.name.toUpperCase() === name.toUpperCase();
}

AccountBalances.prototype.getErc20Balance = function(tokenAddress) {
    for (const erc20Balance of this.erc20Balances) {
        if(erc20Balance.hasTokenAddress(tokenAddress)) {
            return erc20Balance;
        }
    }
    return undefined;
}

AccountBalances.prototype.saveBalance = async function(alias, erc20Instance) {
    const erc20InstanceAddress = erc20Instance.address;
    let erc20Balance = this.getErc20Balance(erc20InstanceAddress);
    if(erc20Balance === undefined) {
        erc20Balance = new Erc20Balances(erc20InstanceAddress)
        this.erc20Balances.push(erc20Balance);
    }
    let balance;

    if(erc20InstanceAddress === ETH) {
        balance = await web3.eth.getBalance(this.address);
    } else {
        balance = await erc20Instance.balanceOf(this.address);
    }

    if(this.verbose) console.log(`Saving balance '${balance}' for alias ${alias} and token ${erc20Balance.tokenAddress}.`);
    erc20Balance.saveBalance(alias, balance);
}

AccountBalances.prototype.saveBalances = async function(alias, erc20Instances) {
    for (const erc20Instance of erc20Instances) {
        await this.saveBalance(alias, erc20Instance);
    }
}

AccountBalances.prototype.getBalancesWei = function(leftAlias, rightAlias) {
    const result = [];
    for (const erc20Balance of this.erc20Balances) {
        const leftAliasBalanceWei = erc20Balance.getBalanceWei(leftAlias);
        const rightAliasBalanceWei = erc20Balance.getBalanceWei(rightAlias);
        const tokenPairAccountBalances = new TokenPairAccountBalances(
            this.name,
            this.address,
            erc20Balance.tokenAddress,
            leftAliasBalanceWei,
            rightAliasBalanceWei
        );
        result.push(tokenPairAccountBalances);
    }
    return result;
}

module.exports = AccountBalances;