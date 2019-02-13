const config = require("../truffle");
const util = require('ethereumjs-util');
const DeployerApp = require('./util/DeployerApp');

// Env configuration
const PLATFORM_FEE_KEY = 'config.platform.fee';
const DEFAULT_PRINT_DEPLOY_COST = false;
const printDeployCostValue = process.env['PRINT_DEPLOY_COST'] == true || DEFAULT_PRINT_DEPLOY_COST;
const platformFee = process.env['PLATFORM_FEE'];

if(platformFee === undefined) {
  throw new Error(`StablePay: Platform fee is not defined in .env file. See details in env.template file.`);
}

// Mock Smart Contracts
const StablePayMock = artifacts.require("./mock/StablePayMock.sol");

// Libraries
const Bytes32ArrayLib = artifacts.require("./util/Bytes32ArrayLib.sol");

// Official Smart Contracts
const Settings = artifacts.require("./base/Settings.sol");
const Role = artifacts.require("./base/Role.sol");
const Vault = artifacts.require("./base/Vault.sol");
const Storage = artifacts.require("./base/Storage.sol");
const StablePayStorage = artifacts.require("./base/StablePayStorage.sol");
const Upgrade = artifacts.require("./base/Upgrade.sol");
const StablePay = artifacts.require("./StablePay.sol");
const SafeMath = artifacts.require("./util/SafeMath.sol");
const AddressLib = artifacts.require("./util/AddressLib.sol");
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

const allowedNetworks = ['ganache'];

module.exports = function(deployer, network, accounts) {
  console.log(`Deploying smart contracts to '${network}'.`)
  
  if(allowedNetworks.indexOf(network) == -1) {
    console.log(`NOT deploying smart contracts to '${network}'.`);
    return;
  }
  
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
    const deployerApp = new DeployerApp(deployer, web3, owner, network);

    await deployerApp.addContractInfoByTransactionInfo(SafeMath, txInfo);

    await deployerApp.deploys([
      Bytes32ArrayLib,
      Storage,
      StablePayCommon,
      AddressLib
    ], {gas: 4000000});

    await deployerApp.deployMockIf(StablePayMock, Storage.address);

    await deployerApp.links(StablePayStorage, [
      Bytes32ArrayLib,
      SafeMath
    ]);
    await deployerApp.deploy(StablePayStorage, Storage.address, {gas: 4000000});
    await deployerApp.deploy(Settings, Storage.address);
    await deployerApp.deploy(Upgrade, Storage.address);
    await deployerApp.deploy(Role, Storage.address);
    await deployerApp.deploy(Vault, Storage.address);

    await deployerApp.links(StablePay, [
      Bytes32ArrayLib,
      SafeMath
    ]);
    await deployerApp.deploy(StablePay, Storage.address);

    const stablePayInstance = await StablePay.deployed();
    const stablePayStorageInstance = await StablePayStorage.deployed();

    // Deploy ZeroxSwappingProvider
    await deployerApp.deploy(
      ZeroxSwappingProvider,
      stablePayInstance.address,
      zeroxContracts.Erc20Proxy,
      zeroxContracts.Exchange,
      zeroxContracts.Weth9,
      {
        from: owner
      }
    );

    const zeroxProviderKey = createPoviderKey('0x','1');

    await stablePayStorageInstance.registerSwappingProvider(
        ZeroxSwappingProvider.address,
        zeroxProviderKey.providerKey
    );
    deployerApp.addData(zeroxProviderKey.name, zeroxProviderKey.providerKey);

    // Deploy KyberSwappingProvider
    await deployerApp.links(KyberSwappingProvider, [
      SafeMath
    ]);
    await deployerApp.deploy(
      KyberSwappingProvider,
      stablePayInstance.address,
      kyberContracts.KyberNetworkProxy,
      {gas: 4000000}
    );
    const kyberProviderKey = createPoviderKey('KyberNetwork', '1');
    await stablePayStorageInstance.registerSwappingProvider(
        KyberSwappingProvider.address,
        kyberProviderKey.providerKey
    );
    deployerApp.addData(kyberProviderKey.name, kyberProviderKey.providerKey);

    const storageInstance = await Storage.deployed();
    await deployerApp.storeContracts(
      storageInstance,
      SafeMath,     Bytes32ArrayLib,    StablePayCommon,
      Settings,     Upgrade,            StablePay,
      ZeroxSwappingProvider,            KyberSwappingProvider,
      Role,         AddressLib,         StablePayStorage,
      Vault
    );
    await deployerApp.setOwner(storageInstance, owner);
    await deployerApp.finalize(storageInstance);

    const settingsInstance = await Settings.deployed();
    await settingsInstance.setPlatformFee(platformFee, {from: owner});
    deployerApp.addData(PLATFORM_FEE_KEY, platformFee);

    deployerApp.writeJson(`./build/${Date.now()}_${network}.json`);
    deployerApp.writeJson();

    if(printDeployCostValue === true) {
      deployerApp.prettyPrint(true);
    }
  });
};
