const config = require("../truffle");
const jsonfile = require('jsonfile');
const contractsJson = './build/contracts.json';

const StandardTokenMock = artifacts.require("./mocks/StandardTokenMock.sol");
const SafeMath = artifacts.require("./util/SafeMath.sol");
const StablePay = artifacts.require("./StablePay.sol");

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
  const owner = accounts[0];

  const initialAmount = 9000000;
  deployer.deploy(StandardTokenMock, owner, initialAmount).then(async () => {
    addContractInfo("StandardTokenMock", StandardTokenMock.address);
    
    await deployer.deploy(SafeMath);
    addContractInfo("SafeMath", SafeMath.address);

    // Deploy StablePay
    const assetProxyAddress = process.env.ERC20PROXY;
    const exchangeAddress = process.env.EXCHANGE;
    const wethAddress = process.env.WETH;
    await deployer.deploy(StablePay, assetProxyAddress, exchangeAddress, wethAddress);
    addContractInfo("StablePay", StablePay.address);

    jsonfile.writeFile(contractsJson, contracts, {spaces: 2, EOL: '\r\n'}, function (err) {
      console.log(`JSON file created at '${contractsJson}'.`);
      if(err) {
        console.error("Errors: " + err);
      }
    });
  });
};
