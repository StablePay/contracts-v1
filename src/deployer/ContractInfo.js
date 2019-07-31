const BigNumber = require('bignumber.js');
const Averager = require('./Averager');

class ContractInfo {
    constructor(web3, order, address, name, costs = [], data = {}) {
        this.web3 = web3;
        this.order = order;
        this.address = address;
        this.name = name;
        this.costs = costs;
        this.data = data;
    }
}

ContractInfo.prototype.getAverageCost = function() {
    const averager = new Averager(this.costs);

    const costAverage = averager.getAverage('totalCost', 4);
    const gasPriceAverage = averager.getAverage('gasPrice', 2);
    const estimatedGasAverage = averager.getAverage('estimatedGas', 2);
    return {
        totalCost: costAverage.average,
        gasPrice: gasPriceAverage.average,
        estimatedGas: estimatedGasAverage.average
    };
}

ContractInfo.prototype.addCostByEstimation = async function (contract, ...params) {
    const gasPrice = await this.web3.eth.getGasPrice();
    const estimatedGas = await contract.new.estimateGas(...params);
    return this.addGenericCost('estimation', gasPrice, estimatedGas);
}

ContractInfo.prototype.addCostByTransactionInfo = async function(txInfo) {
    const tx = await this.web3.eth.getTransaction(txInfo.transactionHash);
    const gasPrice = tx.gasPrice;
    const estimatedGas = tx.gas;
    return this.addGenericCost('tx-info', gasPrice, estimatedGas);
}

ContractInfo.prototype.addCostByAccountBalance = function(initialAccountBalance, finalAccountBalance) {
    const consumedAccountBalance = new BigNumber(initialAccountBalance).minus(new BigNumber(finalAccountBalance));
    return this.addGenericCost(
        'account-balance',
        undefined,
        undefined,
        consumedAccountBalance.toString()
    );
}

ContractInfo.prototype.addGenericCost = function (strategy, gasPrice, estimatedGas, totalCost = -1) {
    let newTotalCost = totalCost;
    if(totalCost === -1) {
        newTotalCost = new BigNumber(gasPrice.toString()).multipliedBy(new BigNumber(estimatedGas.toString()));
    }
    const newCostData = {
        strategy: strategy,
        gasPrice: gasPrice,
        estimatedGas: estimatedGas,
        totalCost: newTotalCost
    };
    this.costs.push(newCostData);
}

ContractInfo.prototype.convertAverageCostTo = function(unitName = 'ether') {
    return this.web3.utils.fromWei(this.getAverageCost().totalCost.toString(), unitName);
}

ContractInfo.prototype.prettyPrint = function(padding = [5, 40, 50, 15]) {
    const averageCost = new BigNumber(this.convertAverageCostTo()).toFixed(8);
    console.log(
        this.order.toString().padStart(padding[0]),
        this.name.padEnd(padding[1]),
        this.address.padEnd(padding[2]),
        averageCost.padStart(padding[3]),
        'ETH'
    );
}

ContractInfo.prototype.prettyPrintCosts = function(unitName = 'ether') {
    const LINE_SEPARATOR_LENGTH = 104;
    const STRATEGY_PADDING = 15;
    const GAS_PRICE_PADDING = 18;
    const ESTIMATED_GAS_PADDING = 15;
    const TOTAL_COST_WEI_PADDING = 25;
    const TOTAL_COST_ETHER_PADDING = 15;
    console.log(`Cost Values for '${this.name}'`.padStart(78));
    console.log("-".repeat(LINE_SEPARATOR_LENGTH));
    console.log(
        'Strategy'.padStart(STRATEGY_PADDING),
        '|',
        'Gas Price (GP)'.padEnd(GAS_PRICE_PADDING),
        '|',
        'Est. Gas (EG)'.padEnd(ESTIMATED_GAS_PADDING),
        '|',
        'GP * EG (Wei)'.padEnd(TOTAL_COST_WEI_PADDING),
        '|',
        'GP * EG'.padEnd(TOTAL_COST_ETHER_PADDING)
    );
    console.log("-".repeat(LINE_SEPARATOR_LENGTH));
    for (const cost of this.costs) {
        const totalCostUnit = this.web3.utils.fromWei(cost.totalCost.toString(), unitName);
        const gasPrice = cost.gasPrice ? cost.gasPrice: '-'
        const estimatedGas = cost.estimatedGas ? cost.estimatedGas: '-';
        console.log(
            cost.strategy.padStart(STRATEGY_PADDING),
            '|',
            gasPrice.toString().padStart(GAS_PRICE_PADDING),
            '|',
            estimatedGas.toString().padStart(ESTIMATED_GAS_PADDING),
            '|',
            cost.totalCost.toString().padStart(TOTAL_COST_WEI_PADDING),
            '|',
            totalCostUnit.padStart(TOTAL_COST_ETHER_PADDING),
            'ETH'
        );  
    }
    console.log("-".repeat(LINE_SEPARATOR_LENGTH));
}

module.exports = ContractInfo;