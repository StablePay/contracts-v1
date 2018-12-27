const config = require("../truffle");
const jsonfile = require('jsonfile');
const util = require('ethereumjs-util');
const contractsJson = './build/contracts.json';

// Mock Smart Contracts


// Official Smart Contracts
const StablePay = artifacts.require("./StablePay.sol");
const SafeMath = artifacts.require("./util/SafeMath.sol");
const StablePayCommon = artifacts.require("./StablePayCommon.sol");
const ZeroxSwappingProvider = artifacts.require("./ZeroxSwappingProvider.sol");
const KyberSwappingProvider = artifacts.require("./KyberSwappingProvider.sol");

const contracts = [];

const addContractInfo = (name, address) => {
  console.log(`Address: ${address} - Name: ${name}`);
  contracts.push(
    {
        "address": address,
        "contractName": name
    }
  );
};

module.exports = function(deployer, network, accounts) {
  const envConf = require('../config')(network);
  const kyberConf = envConf.kyber;
  const zeroxConf = envConf.zerox;
  
  const zeroxContracts = zeroxConf.contracts;
  const zeroxTokens = zeroxConf.tokens;

  const kyberContracts = kyberConf.contracts;
  const kyberWallets = kyberConf.wallets;
  const kyberPermissions = kyberConf.permissions;
  const kyberTokens = kyberConf.tokens;

  const owner = accounts[0];

  const initialAmount = 9000000;
  deployer.deploy(SafeMath).then(async () => {
    addContractInfo("SafeMath", SafeMath.address);

    await deployer.deploy(StablePayCommon);
    addContractInfo("StablePayCommon", StablePayCommon.address);

    // Deploy ZeroxSwappingProvider
    /*
    console.log(zeroxContracts);
    const assetProxyAddress = zeroxContracts.Erc20Proxy;
    const exchangeAddress = zeroxContracts.Exchange;
    const wethAddress = zeroxContracts.Weth9;
    await deployer.deploy(ZeroxSwappingProvider, assetProxyAddress, exchangeAddress, wethAddress);
    addContractInfo("ZeroxSwappingProvider", ZeroxSwappingProvider.address);
    */

    // Deploy KyberSwappingProvider
    await deployer.deploy(KyberSwappingProvider, kyberContracts.KyberNetworkProxy, {from: owner});
    addContractInfo("KyberSwappingProvider", KyberSwappingProvider.address);

    await deployer.link(SafeMath, StablePay);
    await deployer.deploy(StablePay, {from: owner});
    addContractInfo("StablePay", StablePay.address);

    const stablePayInstance = await StablePay.deployed();

    const kyberBytes32 = util.bufferToHex(util.setLengthRight(`KyberSwappingProvider_${KyberSwappingProvider.address}`, 32));

    console.log(`KyberSwappingProvider => ${kyberBytes32} = ${KyberSwappingProvider.address}.`);

    await stablePayInstance.registerSwappingProvider(
        KyberSwappingProvider.address,
        kyberBytes32
    );

    /*
    await stablePayInstance.registerProviders(
        config.web3.utils.soliditySha3('ZeroxSwappingProvider', ZeroxSwappingProvider.address),
        [ZeroxSwappingProvider.address]
    );
    */

    jsonfile.writeFile(contractsJson, contracts, {spaces: 2, EOL: '\r\n'}, function (err) {
      console.log(`JSON file created at '${contractsJson}'.`);
      if(err) {
        console.error("Errors: " + err);
      }
    });
  });
};
