const { providers, Contract } = require('ethers');

const ContractWrapper = (abi,address,provider, accounts, index) => {
    const accountIndex = index || 0;
    let web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner(accounts[accountIndex]);
    return new Contract(address, abi, signer);
}

const ContractWrapperByAccount = (abi,address,provider, account) => {
    let web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner(account);
    return new Contract(address, abi, signer);
}

module.exports = {
    ContractWrapper,
    ContractWrapperByAccount
};