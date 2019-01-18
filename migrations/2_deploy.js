const config = require("../truffle");
const util = require('ethereumjs-util');
const DeployerApp = require('./util/DeployerApp');

// Mock Smart Contracts

// Libraries
const Bytes32ArrayLib = artifacts.require("./util/Bytes32ArrayLib.sol");

// Official Smart Contracts
const Settings = artifacts.require("./base/Settings.sol");
const Storage = artifacts.require("./base/Storage.sol");
const Upgrade = artifacts.require("./base/Upgrade.sol");
const StablePay = artifacts.require("./StablePay.sol");
const SafeMath = artifacts.require("./util/SafeMath.sol");
const StablePayCommon = artifacts.require("./StablePayCommon.sol");
const ZeroxSwappingProvider = artifacts.require("./providers/ZeroxSwappingProvider.sol");
const KyberSwappingProvider = artifacts.require("./providers/KyberSwappingProvider.sol");

const createPoviderKey = (name, version) => {
  const providerName = `${name}_v${version}`;
  return {
    name: providerName,
    providerKey: util.bufferToHex(util.setLengthRight(providerName, 32))
  };
};

module.exports = function(deployer, network, accounts) {
  console.log(`Deploying smart contracts to '${network}'.`)
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

  deployer.deploy(SafeMath).then(async (txInfo) => {

    const deployerApp = new DeployerApp(deployer, web3, owner);

    await deployerApp.addContractInfoByTransactionInfo(SafeMath, txInfo);

    await deployerApp.deploys([
      Bytes32ArrayLib,
      Storage,
      StablePayCommon
    ]);

    await deployerApp.deploy(Settings, Storage.address);
    await deployerApp.deploy(Upgrade, Storage.address);

    await deployerApp.links(StablePay, [
      Bytes32ArrayLib,
      SafeMath
    ]);
    await deployerApp.deploy(StablePay, Storage.address, {from: owner});
    
    const stablePayInstance = await StablePay.deployed();

    // Deploy ZeroxSwappingProvider
    await deployerApp.deploy(
      ZeroxSwappingProvider,
      zeroxContracts.Erc20Proxy,
      zeroxContracts.Exchange,
      zeroxContracts.Weth9,
      {
        from: owner
      }
    );

    const zeroxProviderKey = createPoviderKey('0x','1');
    await stablePayInstance.registerSwappingProvider(
        ZeroxSwappingProvider.address,
        zeroxProviderKey.providerKey
    );
    deployerApp.addData(zeroxProviderKey.name, zeroxProviderKey.providerKey);

    // Deploy KyberSwappingProvider
    console.log("kyberContracts.KyberNetworkProxy");
    console.log(kyberContracts.KyberNetworkProxy);
    await deployerApp.deploy(
      KyberSwappingProvider,
      kyberContracts.KyberNetworkProxy
    );
    const kyberProviderKey = createPoviderKey('KyberNetwork', '1');
    
    await stablePayInstance.registerSwappingProvider(
        KyberSwappingProvider.address,
        kyberProviderKey.providerKey
    );
    deployerApp.addData(kyberProviderKey.name, kyberProviderKey.providerKey);
    
    deployerApp.writeJson();

    //deployerApp.prettyPrint(true);
  });
};
