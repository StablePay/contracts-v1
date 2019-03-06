const _ = require('lodash');
const jsonfile = require('jsonfile');
const BigNumber = require('bignumber.js');
const Averager = require('./Averager');
const ContractInfo = require('./ContractInfo');


const addContractInfo = (contracts, verbose, name, address, deploymentCosts, data = {}) => {
    if(verbose) {
        //console.log(`Gas: ${estimatedGas} Cost: ${deployCost} Address: ${address} - Name: ${name}`);
    }
    let averageCost = getAverageCost(deploymentCosts);
    console.log('averageCost');
    console.log(averageCost);

    contracts.push(
        {
            "order": contracts.length + 1, 
            "address": address,
            "contractName": name,
            'deploymentCosts': deploymentCosts,
            'averageCost': averageCost,
            "data": data
        }
    );
};

class DeployerApp {
    constructor(deployer, web3, account, network, mockNetworks = ["test"], verbose = true) {
        this.data = new Map();
        this.verbose = verbose;
        this.web3 = web3;
        this.account = account;
        this.contracts = [];
        this.deployer = deployer;
        this.network = network;
        this.mockNetworks = mockNetworks;
    }
}

DeployerApp.prototype.prettyPrintCosts = async function(number) {
    const contract = this.contracts[number - 1];
    if(typeof contract === undefined) {
        console.log(`Data not found for ${number}.`);
        return;
    }

    console.log(`Cost Data Values: ${contract.contractName}`);
    console.log(
        'Strategy'.padStart(25),
        '|',
        'Gas Price (GP)'.padEnd(30),
        '|',
        'Estimated Gas (EG)'.padEnd(30),
        '|',
        'GP * EG'.padEnd(40),
        '|',
        'GP * EG'.padEnd(30),

    );
    for (const costData of contract.deploymentCosts) {
        console.log(
            costData.padStart(25),
            costData.gasPrice.padEnd(20),
            costData.estimatedGas.padEnd(20),
            costData.totalCost.padEnd(20),
            await this.web3.fromWei(costData.totalCost, 'ether'),
            'ETH'
        ); 
    }
}

const createCostData = function (strategy, gasPrice, estimatedGas, totalCost = -1) {
    let newTotalCost = totalCost;
    if(totalCost === -1) {
        newTotalCost = new BigNumber(gasPrice.toString()).multipliedBy(new BigNumber(estimatedGas.toString()));
    }
    return {
        strategy: strategy,
        gasPrice: gasPrice,
        estimatedGas: estimatedGas,
        totalCost: newTotalCost.toString()
    };
}

const createCostDataByNewEstimation = async (web3, contract, ...params) => {
    const gasPrice = await web3.eth.getGasPrice();
    const estimatedGas = await contract.new.estimateGas(...params);
    return createCostData('truffle-estimation', gasPrice, estimatedGas);
}

const createCostDataByTransactionInfo = async function(web3, txInfo) {
    const tx = await web3.eth.getTransaction(txInfo.transactionHash);
    const gasPrice = tx.gasPrice;
    const estimatedGas = tx.gas;
    return createCostData('tx-info', gasPrice, estimatedGas);
}

const createCostDataByAccountBalance = function(initialAccountBalance, finalAccountBalance) {
    const consumedAccountBalance = new BigNumber(initialAccountBalance).minus(new BigNumber(finalAccountBalance));
    return createCostData(
        'account-balance',
        undefined,
        undefined,
        consumedAccountBalance.toString()
    );
}

DeployerApp.prototype.deploy = async function(contract, ...params) {
    const initialAccountBalance = await this.web3.eth.getBalance(this.account);
    // https://ethereum.stackexchange.com/questions/42950/how-to-get-the-transaction-cost-in-a-truffle-unit-test
    const txInfo = await this.deployer.deploy(contract, ...params);
    
    const newContractInfo = new ContractInfo(
        this.web3,
        this.contracts.length + 1,
        contract.address,
        contract.contractName
    );
    await newContractInfo.addCostByEstimation(contract, ...params);
    await newContractInfo.addCostByTransactionInfo(txInfo);
    const finalAccountBalance = await this.web3.eth.getBalance(this.account);
    newContractInfo.addCostByAccountBalance(initialAccountBalance, finalAccountBalance);

    this.contracts.push(newContractInfo);
}

DeployerApp.prototype.totalDeployCost = function(unitName = 'ether') {
    const averageCosts = this.contracts.map(function(contractInfo) {
        return contractInfo.getAverageCost();
    });
    const averager = new Averager(averageCosts);
    const totalCostAverage = averager.getAverage('totalCost', 4);
    return this.web3.utils.fromWei(totalCostAverage.total.toString(), unitName);
}

DeployerApp.prototype.addData = function(key, data) {
    this.data.set(key, data);
}

DeployerApp.prototype.addContractInfoByTransactionInfo = async function(contract, txInfo) {
    const newContractInfo = new ContractInfo(
        this.web3,
        this.contracts.length + 1,
        contract.address,
        contract.contractName
    );
    await newContractInfo.addCostByTransactionInfo(txInfo);
    this.contracts.push(newContractInfo);
}

DeployerApp.prototype.canDeployMock = function() {
    return this.mockNetworks.indexOf(this.network) > -1;
}

DeployerApp.prototype.deployMockIf = async function(contract, ...params) {
    if(this.canDeployMock()) {
        await this.deploy(contract, ...params);
    }
}

DeployerApp.prototype.deployMocksIf = async function(contracts, ...params) {
    for (const key in contracts) {
        if (contracts.hasOwnProperty(key)) {
            const contract = contracts[key];
            await this.deployMockIf(contract, ...params);
        }
    }
}

DeployerApp.prototype.deploys = async function(contracts, ...params) {
    for (const key in contracts) {
        if (contracts.hasOwnProperty(key)) {
            const contract = contracts[key];
            await this.deploy(contract, ...params);
        }
    }
}

DeployerApp.prototype.links = async function(contract, libraries) {
    for (const key in libraries) {
        if (libraries.hasOwnProperty(key)) {
            const library = libraries[key];
            await this.deployer.link(library, contract);
        }
    }
}

DeployerApp.prototype.writeJson = function(outputJson = './build/contracts.json') {
    const jsonData = {
        contracts: [],
        data: []
    };

    for (const contractInfo of this.contracts) {
        jsonData.contracts.push({
            order: contractInfo.order,
            address: contractInfo.address,
            name: contractInfo.name,
            costs: contractInfo.costs,
            data: contractInfo.data
        });
    }

    const keys = Array.from(this.data.keys());

    for (const key of keys) {
        jsonData.data.push({
            key: key,
            value: this.data.get(key)
        });
    }

    jsonfile.writeFile(outputJson, jsonData, {spaces: 4, EOL: '\r\n'}, function (err) {
      console.log(`JSON file created at '${outputJson}'.`);
      if(err) {
        console.error("Errors: " + err);
      }
    });
}

DeployerApp.prototype.writeCustomJson = function(customFileProcessor, outputJson = './build/contracts.json') {
    const data = {
        contracts: this.contracts,
        data: this.data
    };
    const jsonData = customFileProcessor(data);

    jsonfile.writeFile(outputJson, jsonData, {spaces: 4, EOL: '\r\n'}, function (err) {
      console.log(`Custom JSON file created at '${outputJson}'.`);
      if(err) {
        console.error("Errors: " + err);
      }
    });
}

/*
contracts: {
		StablePay: '0x57c3F9D35252e9678c865D76aFF51a070aBC0417',
		StablePayStorage: '0xE15112177A8e2b57C2cAf6a989ACdD3592183914',
		Settings: '0x5C2642a9Ba20E0C8548730985F788ff8Bd96dAE8',
		Vault: '0x6bbB103cEf482518C8bcf3182c00B3B5036acD42',
		KyberSwappingProvider: '0x3781acc49714cabdc343E333485991Bf854cB312'
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		ZeroX: '0x30785f7631000000000000000000000000000000000000000000000000000000'
	}
*/

DeployerApp.prototype.prettyPrint = function(printStrategyCosts = false) {
    console.log("Estimated Cost per Smart Contract".padStart(123));
    console.log("=".repeat(123));
    console.log(
        "#".padStart(5),
        "Contract".padEnd(40),
        "Address".padEnd(50),
        "Deploy Cost".padStart(15)
    );
    for (const contract of this.contracts) {
        contract.prettyPrint();
    }
    console.log("=".repeat(123));
    
    const totalDeployCostString = this.totalDeployCost('ether');
    const totalDeployCost = new BigNumber(totalDeployCostString).toFixed(8);
    console.log(
        `Total Deployment Cost:`.padStart(95),
        totalDeployCost.padStart(15),
        'ETH'
    );
    console.log('\n');
    if(printStrategyCosts) {
        for (const contract of this.contracts) {
            contract.prettyPrintCosts();
            console.log('\n');
        }
    }
}

DeployerApp.prototype.getContractData = function(contractName) {
    for (const contract of this.contracts) {
        if(contract.name.toLowerCase() === contractName.toLowerCase() ) {
            return contract;
        }
    }
    return undefined;
}

DeployerApp.prototype.storeContract = async function(storageInstance, contract) {
    const contractInfo = this.getContractData(contract.contractName);
    console.log(`Storing contract info '${contract.contractName}' => ${contract.address}`)
    const contractNameSha3 = this.web3.utils.soliditySha3('contract.name', contract.contractName);
    await storageInstance.setAddress(
        contractNameSha3,
        contract.address
    );
    //console.log(`SHA3 ('contract.name','${contract.contractName}') = '${contractNameSha3}'`);

    const contractAddressSha3 = this.web3.utils.soliditySha3('contract.address', contract.address);
    await storageInstance.setAddress(
        contractAddressSha3,
        contract.address
    );
    //console.log(`SHA3 ('contract.address','${contract.address}') = '${contractAddressSha3}'`);
    contractInfo.data.sha3 = {};
    contractInfo.data.sha3[`contract_address_${contract.address}`] = contractAddressSha3;
    contractInfo.data.sha3[`contract_name_${contract.contractName}`] = contractNameSha3;
}

DeployerApp.prototype.storeContracts = async function(storageInstance, ...contracts) {
    for (const contract of contracts) {
        await this.storeContract(storageInstance, contract);
    }
}

DeployerApp.prototype.setOwner = async function(storageInstance, ownerAddress) {
    console.log(`Setting platform owner to address ${ownerAddress}.`);
    const contractNameOwnerSha3 = this.web3.utils.soliditySha3('contract.name', 'owner');
    await storageInstance.setAddress(
        contractNameOwnerSha3,
        ownerAddress
    );
    this.addData(`contract.name_owner`,{
        sha3: contractNameOwnerSha3,
        ownerAddress: ownerAddress
    });
    
    // Register owner in bool
    const accessRoleOwnerSha3 = this.web3.utils.soliditySha3('access.role', 'owner', ownerAddress);
    await storageInstance.setBool(
        accessRoleOwnerSha3,
        true
    );
    this.addData(`access.role_owner_${ownerAddress}`, {
        sha3: accessRoleOwnerSha3,
        value: true
    });
}

DeployerApp.prototype.finalize = async function(storageInstance) {
    // Disable direct access to storage now
    console.log(`Disabling direct access to storage.`);
    const contractStorageInitialisedSha3 = this.web3.utils.soliditySha3('contract.storage.initialised');
    await storageInstance.setBool(
        contractStorageInitialisedSha3,
        true
    );
    this.addData(`contract.storage.initialised`, {
        sha3: contractStorageInitialisedSha3,
        value: true
    });
}

module.exports = DeployerApp;