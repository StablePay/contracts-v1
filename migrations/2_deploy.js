const config = require("../truffle");
const appConfig = require('../src/config');

const DeployerApp = require('../src/deployer/DeployerApp');
const ProviderKeyGenerator = require('../src/utils/ProviderKeyGenerator');

/** Platform configuration keys for smart contracts. */
const PLATFORM_FEE_KEY = 'config.platform.fee';

/** Platform configuration values. */
const printDeployCostValue = appConfig.getPrintDeployCost().get();
const platformFee = appConfig.getPlatformFee().get();
const maxGasForDeploying = 5000000;

// Mock Smart Contracts
const BaseMock = artifacts.require("./mock/BaseMock.sol");
const StablePayBaseMock = artifacts.require("./mock/StablePayBaseMock.sol");
const StablePayStorageMock = artifacts.require("./mock/StablePayStorageMock.sol");
const CustomSwappingProviderMock = artifacts.require("./mock/CustomSwappingProviderMock.sol");

// Libraries
const Bytes32ArrayLib = artifacts.require("./util/Bytes32ArrayLib.sol");
const SafeMath = artifacts.require("./util/SafeMath.sol");
const AddressLib = artifacts.require("./util/AddressLib.sol");

// Official Smart Contracts
const Settings = artifacts.require("./base/Settings.sol");
const Role = artifacts.require("./base/Role.sol");
const Vault = artifacts.require("./base/Vault.sol");
const Storage = artifacts.require("./base/Storage.sol");
const StablePayStorage = artifacts.require("./base/StablePayStorage.sol");
const Upgrade = artifacts.require("./base/Upgrade.sol");
const StablePay = artifacts.require("./StablePay.sol");
const StablePayBase = artifacts.require("./base/StablePayBase.sol");
const StablePayCommon = artifacts.require("./StablePayCommon.sol");
const KyberSwappingProvider = artifacts.require("./providers/KyberSwappingProvider.sol");

const UniswapSwappingProvider = artifacts.require("./providers/UniswapSwappingProvider.sol");

const UniswapFactoryInterface = artifacts.require("./uniswap/UniswapFactoryInterface.sol");
const UniswapTemplateExchangeInterface = artifacts.require("./uniswap/UniswapExchangeInterface.sol");

const allowedNetworks = ['ganache', 'test'];

module.exports = function(deployer, network, accounts) {
  console.log(`Deploying smart contracts to '${network}'.`)
  
  const networkIndex = allowedNetworks.indexOf(network);
  if(networkIndex === -1) {
    console.log(`NOT deploying smart contracts to '${network}'.`);
    return;
  }

  const providerKeyGenerator = new ProviderKeyGenerator();

  const envConf = require('../config')(network);
  const stablePayConf = envConf.stablepay;
  const kyberConf = envConf.kyber;
  const uniswapConf = envConf.uniswap;

  const kyberContracts = kyberConf.contracts;
  const kyberTokens = kyberConf.tokens;

  const uniswapContracts = uniswapConf.contracts;


  const owner = accounts[0];
  let uniswapFactory;
  let exchangeTemplate;

  deployer.deploy(SafeMath).then(async (txInfo) => {
    if(allowedNetworks.includes(network)){
      console.log('deploying uniswap contracts');

      let factoryABI = new web3.eth.Contract(JSON.parse(uniswapConf.factory.abi));
      let exchangeBI = new web3.eth.Contract(JSON.parse(uniswapConf.exchange.abi));

      const factoryResult = await factoryABI.deploy({
        data: uniswapConf.factory.bytecode
      }).send({
        from: owner,
        gas: 1500000,
        gasPrice: 90000 * 2
      });
      uniswapFactory = await UniswapFactoryInterface.at(factoryResult.options.address);
      console.log('uniswapFactory', uniswapFactory.address);
      const exchangeTemplateResult = await exchangeBI.deploy({
        data: uniswapConf.exchange.bytecode
      }).send({
        from: owner,
        gas: 5500000,
        gasPrice: 90000 * 2
      });

      exchangeTemplate = await UniswapTemplateExchangeInterface.at(exchangeTemplateResult.options.address);
      await uniswapFactory.initializeFactory(exchangeTemplate.address, {from: owner});

      console.log('setting up uniswap contracts addresses');
      uniswapContracts.factory = uniswapFactory.address;
    }




    const deployerApp = new DeployerApp(deployer, web3, owner, network);
    
    await deployerApp.addContractInfoByTransactionInfo(SafeMath, txInfo);
    
    await deployerApp.deploys([
      Bytes32ArrayLib,
      Storage,
      StablePayCommon,
      AddressLib
    ], {gas: maxGasForDeploying});
    
    await deployerApp.deployMockIf(StablePayBaseMock, Storage.address);
    await deployerApp.deployMockIf(StablePayStorageMock, Storage.address);
    await deployerApp.deployMockIf(BaseMock, Storage.address);

    await deployerApp.links(StablePayStorage, [
      Bytes32ArrayLib,
      SafeMath
    ]);
    await deployerApp.deploy(StablePayStorage, Storage.address, {gas: maxGasForDeploying});
    await deployerApp.deploy(Settings, Storage.address, {gas: maxGasForDeploying});
    await deployerApp.deploy(Upgrade, Storage.address, {gas: maxGasForDeploying});
    await deployerApp.deploy(Role, Storage.address, {gas: maxGasForDeploying});
    await deployerApp.deploy(Vault, Storage.address);

    await deployerApp.deploy(StablePay, Storage.address, {gas: maxGasForDeploying});

    await deployerApp.links(StablePayBase, [
      Bytes32ArrayLib,
      SafeMath
    ]);
    await deployerApp.deploy(StablePayBase, Storage.address, {gas: maxGasForDeploying});

    /***********************************
     Deploy swapping token providers.
     ***********************************/


    const stablePayInstance = await StablePay.deployed();
    const stablePayStorageInstance = await StablePayStorage.deployed();

    await deployerApp.deployMockIf(CustomSwappingProviderMock, stablePayInstance.address);

    /** Deploying Kyber swap provider. */
    await deployerApp.links(KyberSwappingProvider, [
      SafeMath
    ]);
    await deployerApp.deploy(
        KyberSwappingProvider,
        stablePayInstance.address,
        kyberContracts.KyberNetworkProxy,
        {gas: maxGasForDeploying}
    );
    const kyberProviderKey = providerKeyGenerator.generateKey('KyberNetwork', '1');
    await stablePayStorageInstance.registerSwappingProvider(
        KyberSwappingProvider.address,
        kyberProviderKey.providerKey
    );
    deployerApp.addData(kyberProviderKey.name, kyberProviderKey.providerKey);

    /** Deploying Uniswap swap provider. */
    await deployerApp.links(UniswapSwappingProvider, [
      SafeMath
    ]);
    await deployerApp.deploy(
        UniswapSwappingProvider,
        stablePayInstance.address,
        uniswapContracts.factory,
        {gas: maxGasForDeploying}
    );
    const uniswapProviderKey = providerKeyGenerator.generateKey('Uniswap', '1');
    await stablePayStorageInstance.registerSwappingProvider(
        UniswapSwappingProvider.address,
        uniswapProviderKey.providerKey
    );
    deployerApp.addData(uniswapProviderKey.name, uniswapProviderKey.providerKey);


    /***************************************************************
     Saving smart contract permissions/roles and closing platform.
     ***************************************************************/
    const storageInstance = await Storage.deployed();

    /** Storing smart contracts data. */
    await deployerApp.storeContracts(
        storageInstance
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
        console.log(` Token '${tokenAvailability.name}' availability  configured: Address: '${tokenAddress}' - MinAmount: '${minAmount}' - MaxAmount: '${maxAmount}'.`);
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