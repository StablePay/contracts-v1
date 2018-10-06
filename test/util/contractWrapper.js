const ethers =  require('ethers');
const { providers, Contract } = require('ethers');
// const web3Provider = new providers.Web3Provider(web3.currentProvider);

const ContractWrapper = (abi,address,provider, accounts, index) => {
    const accountIndex = index || 0;
    let web3Provider = new providers.Web3Provider(provider);
    const signer = web3Provider.getSigner(accounts[accountIndex]);

    return new Contract(address, abi, signer);

}


module.exports = ContractWrapper;