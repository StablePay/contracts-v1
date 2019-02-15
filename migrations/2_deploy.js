const config = require("../truffle");
const util = require('ethereumjs-util');
const DeployerApp = require('./util/DeployerApp');

/** Default platform configuration values. */
const DEFAULT_PRINT_DEPLOY_COST = false;
const DEFAULT_DAI_MIN_AMOUNT=10
const DEFAULT_DAI_MAX_AMOUNT=100

/** Platform configuration keys. */
const PLATFORM_FEE_KEY = 'config.platform.fee';

/** Platform configuration values. */
const printDeployCostValue = process.env['PRINT_DEPLOY_COST'] == true || DEFAULT_PRINT_DEPLOY_COST;
const platformFee = process.env['PLATFORM_FEE'];
const daiMinAmount = process.env['DAI_MIN_AMOUNT'] || DEFAULT_DAI_MIN_AMOUNT;
const daiMaxAmount = process.env['DAI_MAX_AMOUNT'] || DEFAULT_DAI_MAX_AMOUNT;

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
  
  //if(allowedNetworks.indexOf(network) == -1) {
  //  console.log(`NOT deploying smart contracts to '${network}'.`);
  //  return;
  //}
  
  const envConf = require('../config')(network);
  const stablePayConf = envConf.stablepay;
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
    await deployerApp.deploy(Settings, Storage.address, {gas: 4000000});
    await deployerApp.deploy(Upgrade, Storage.address);
    await deployerApp.deploy(Role, Storage.address, {gas: 4000000});
    await deployerApp.deploy(Vault, Storage.address);
    
    await deployerApp.links(StablePay, [
      Bytes32ArrayLib,
      SafeMath
    ]);
    await deployerApp.deploy(StablePay, Storage.address, {gas: 4000000});

    /***********************************
      Deploy swapping token providers.
     ***********************************/

    const stablePayInstance = await StablePay.deployed();
    const stablePayStorageInstance = await StablePayStorage.deployed();

    /** Deploying 0x swap provider. */
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

    /** Deploying Kyber swap provider. */
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


    /***************************************************************
      Saving smart contract permissions/roles and closing platform.
     ***************************************************************/
    const storageInstance = await Storage.deployed();

    /** Storing smart contracts data. */
    await deployerApp.storeContracts(
      storageInstance,
      SafeMath,     Bytes32ArrayLib,    StablePayCommon,
      Settings,     Upgrade,            StablePay,
      ZeroxSwappingProvider,            KyberSwappingProvider,
      Role,         AddressLib,         StablePayStorage,
      Vault
    );

    /** Setting ownership for specific account. */
    await deployerApp.setOwner(storageInstance, owner);
    /** Finalizing / closing platform. */
    await deployerApp.finalize(storageInstance);

    /****************************************
      Setting platform configuration values.
     ****************************************/
    const settingsInstance = await Settings.deployed();
    await settingsInstance.setPlatformFee(platformFee, {from: owner});
    deployerApp.addData(PLATFORM_FEE_KEY, platformFee);

    /** Configuring token address availability in platform. */
    for (const tokenAvailability of stablePayConf.targetTokens) {
      const tokenAddress = kyberTokens[tokenAvailability.name];
      const minAmount = tokenAvailability.minAmount;
      const maxAmount = tokenAvailability.maxAmount;
      if(tokenAddress === undefined || minAmount === undefined || maxAmount === undefined) {
        console.log(`Token '${tokenAvailability.name}' availability not configured: Address: '${tokenAddress}' - MinAmount: '${minAmount}' - MaxAmount: '${maxAmount}'.`);
      } else {
        await settingsInstance.setTokenAvailability(tokenAddress, minAmount, maxAmount, {from: owner});
        deployerApp.addData(`Token_${tokenAvailability.name}_Kyber_${tokenAddress}`, {minAmount: minAmount, maxAmount: maxAmount});
      }
    }

    /** Writing smart contract data into JSON file. */
    deployerApp.writeJson(`./build/${Date.now()}_${network}.json`);
    deployerApp.writeJson();

    if(printDeployCostValue === true) {
      deployerApp.prettyPrint(true);
    }
  });
};
