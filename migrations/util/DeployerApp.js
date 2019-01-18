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
    constructor(deployer, web3, account, verbose = true) {
        this.data = new Map();
        this.verbose = verbose;
        this.web3 = web3;
        this.account = account;
        this.contracts = [];
        this.deployer = deployer;
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


DeployerApp.prototype.deploys = async function(contracts) {
    for (const key in contracts) {
        if (contracts.hasOwnProperty(key)) {
            const contract = contracts[key];
            await this.deploy(contract);
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
            providerKey: key,
            providerAddress: this.data.get(key)

        });
    }

    jsonfile.writeFile(outputJson, jsonData, {spaces: 4, EOL: '\r\n'}, function (err) {
      console.log(`JSON file created at '${outputJson}'.`);
      if(err) {
        console.error("Errors: " + err);
      }
    });
}

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

module.exports = DeployerApp;