const BigNumber = require('bignumber.js');
const AmountsCalculator = require('./AmountsCalculator');

class RatesCalculator {
    constructor(kyberProxy, stablePay) {
        this.kyberProxy = kyberProxy;
        this.stablePay = stablePay;
    }
}

RatesCalculator.prototype.calculateRates = async function(sourceTokenAddress, targetTokenAddress, targetTokenAmount) {
        const kyberProxyUnitaryPriceRateRange = await this.kyberProxy.getExpectedRate(
            sourceTokenAddress,
            targetTokenAddress,
            "1"
        );
        const amountsCalculator = new AmountsCalculator(targetTokenAmount)
        const kyberProxyUnitaryRateMinAmount = amountsCalculator.calculateAmountBased(kyberProxyUnitaryPriceRateRange.slippageRate).decimalPlaces(0);
        const kyberProxyUnitaryRateMaxAmount = amountsCalculator.calculateAmountBased(kyberProxyUnitaryPriceRateRange.expectedRate).decimalPlaces(0);

        const kyberProxyMaxAmountRateRange = await this.kyberProxy.getExpectedRate(
            sourceTokenAddress,
            targetTokenAddress,
            kyberProxyUnitaryRateMaxAmount.toString()
        );
        //assert(getExpectedRateResult_2);

        const kyberProxyMaxAmount = amountsCalculator.calculateAmountBased(kyberProxyMaxAmountRateRange.slippageRate).decimalPlaces(0);
        const kyberProxyMinAmount = amountsCalculator.calculateAmountBased(kyberProxyMaxAmountRateRange.expectedRate).decimalPlaces(0);

        console.log(kyberProxyMaxAmount.toString());
        const stablePayMaxAmountRateRange = await this.stablePay.getExpectedRateRange(
            sourceTokenAddress,
            targetTokenAddress,
            kyberProxyMaxAmount.toString()
        );

        const stablePayMaxAmount = amountsCalculator.calculateAmountBased(stablePayMaxAmountRateRange.minRate).decimalPlaces(0);
        const stablePayMinAmount = amountsCalculator.calculateAmountBased(stablePayMaxAmountRateRange.maxRate).decimalPlaces(0);

        this.printRange('Kyber - Unitary Price', kyberProxyUnitaryRateMaxAmount, kyberProxyUnitaryRateMinAmount, kyberProxyUnitaryPriceRateRange.slippageRate,kyberProxyUnitaryPriceRateRange.expectedRate);

        this.printRange('Kyber', kyberProxyMinAmount, kyberProxyMaxAmount, kyberProxyMaxAmountRateRange.expectedRate, kyberProxyMaxAmountRateRange.slippageRate);

        this.printRange('StablePay', stablePayMinAmount, stablePayMaxAmount, stablePayMaxAmountRateRange.minRate, stablePayMaxAmountRateRange.maxRate);

        const rates = [
            kyberProxyUnitaryPriceRateRange.expectedRate,
            kyberProxyMaxAmountRateRange.slippageRate,
            kyberProxyMaxAmountRateRange.expectedRate,
            stablePayMaxAmountRateRange.minRate,
            stablePayMaxAmountRateRange.maxRate
        ];

        const amounts = [
            kyberProxyUnitaryRateMaxAmount,
            kyberProxyMaxAmount,
            kyberProxyMinAmount,
            stablePayMaxAmount,
            stablePayMinAmount
        ];

        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);

        const minAmount = Math.min(...amounts);
        const maxAmount = Math.max(...amounts);

        this.printRange('Min/Max', minAmount, maxAmount, minRate, maxRate);

        return {
            minAmount: minAmount.toString(),
            maxAmount: maxAmount.toString(),
            minRate: minRate.toString(),
            maxRate: maxRate.toString()
        };
}

RatesCalculator.prototype.printRange = function(message, minAmount, maxAmount, minRate, maxRate) {
    console.log(`${'-'.repeat(10)}`);
    console.log(`${message}:`);
    console.log(`Rates (min-max):       ${minRate.toString()}-${maxRate.toString()}`);
    console.log(`Amounts (min-max):     ${minAmount.toString()}-${maxAmount.toString()}`);
    console.log(`${'-'.repeat(50)}`);
}

module.exports = RatesCalculator;