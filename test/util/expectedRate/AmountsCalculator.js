const BigNumber = require('bignumber.js');

class AmountsCalculator {
    constructor(amount) {
        this.divider = (new BigNumber(10)).pow(18);
        this.amount = BigNumber(amount.toString());
    }
}

AmountsCalculator.prototype.calculateUnitPrice = function(rate, decimalPlaces = 10) {
    const expectedRate = BigNumber(rate.toString());
    const unitPrice = expectedRate.div(this.divider);
    return unitPrice.decimalPlaces(decimalPlaces);
}

AmountsCalculator.prototype.calculateAmountBased = function(rate, decimalPlaces = 10) {
    const unitPrice = this.calculateUnitPrice(rate, decimalPlaces);
    const calculatedSourceAmount = this.amount.div(unitPrice);
    return calculatedSourceAmount.decimalPlaces(decimalPlaces);
}

AmountsCalculator.prototype.calculateAmountFee = function(feePercentage, decimalPlaces = 10) {
    return BigNumber(feePercentage.toString()).times(this.amount).div(100).decimalPlaces(decimalPlaces);
}

AmountsCalculator.prototype.calculateAmountWithFee = function(feePercentage, decimalPlaces = 10) {
    const feeAmount = this.calculateAmountFee(feePercentage, decimalPlaces);
    return this.amount.plus(feeAmount);
}

AmountsCalculator.prototype.calculateAmountBasedFee = function(rate, feePercentage, decimalPlaces = 10) {
    const amountWithFee = this.calculateAmountWithFee(feePercentage, decimalPlaces);
    const unitPrice = this.calculateUnitPrice(rate, decimalPlaces);
    const calculatedSourceAmount = amountWithFee.div(unitPrice);
    return calculatedSourceAmount.decimalPlaces(decimalPlaces);
}

module.exports = AmountsCalculator;