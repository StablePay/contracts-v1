const BigNumber = require('bignumber.js');
const AmountsCalculator = require('./AmountsCalculator');

const divider = (new BigNumber(10)).pow(18);

class RatesCalculator {
    constructor(kyberProxy, providerRegistry) {
        this.kyberProxy = kyberProxy;
        this.providerRegistry = providerRegistry;
    }
}

RatesCalculator.prototype.calculateRates = async function(sourceTokenAddress, targetTokenAddress, targetTokenAmount, minGetExpectedRateQuantity = "1") {
    //console.log('aaa    ', sourceTokenAddress, '    ',  targetTokenAddress);
    //console.log(this.kyberProxy.address);

    const targetTokenAmountInWeis = BigNumber(targetTokenAmount).times(divider);
    console.log('targetTokenAmountInWeis    ', targetTokenAmountInWeis);
        
        const kyberProxyUnitaryPriceRateRange = await this.kyberProxy.getExpectedRate(
            sourceTokenAddress,
            targetTokenAddress,
            BigNumber(minGetExpectedRateQuantity).times(divider)
        );
//        console.log('aaa111 ');
//        console.log(kyberProxyUnitaryPriceRateRange.expectedRate.toString());
//        console.log(kyberProxyUnitaryPriceRateRange.slippageRate.toString());
        const amountsCalculator = new AmountsCalculator(targetTokenAmountInWeis)
        const kyberProxyUnitaryRateMinAmount = amountsCalculator.calculateAmountBased(kyberProxyUnitaryPriceRateRange.slippageRate).decimalPlaces(0);
        const kyberProxyUnitaryRateMaxAmount = amountsCalculator.calculateAmountBased(kyberProxyUnitaryPriceRateRange.expectedRate).decimalPlaces(0);
        console.log('bbb    ', kyberProxyUnitaryRateMinAmount.toString());
        console.log('bbb    ', kyberProxyUnitaryRateMaxAmount.toString());
        console.log(kyberProxyUnitaryRateMinAmount.toFixed());
        console.log(kyberProxyUnitaryRateMaxAmount.toFixed());

        const kyberProxyMaxAmountRateRange = await this.kyberProxy.getExpectedRate(
            sourceTokenAddress,
            targetTokenAddress,
            kyberProxyUnitaryRateMaxAmount.toFixed()
        );
        //assert(getExpectedRateResult_2);
        console.log(kyberProxyMaxAmountRateRange.expectedRate.toString());
        console.log(kyberProxyMaxAmountRateRange.slippageRate.toString());

        const kyberProxyMaxAmount = amountsCalculator.calculateAmountBased(kyberProxyMaxAmountRateRange.slippageRate).decimalPlaces(0);
        const kyberProxyMinAmount = amountsCalculator.calculateAmountBased(kyberProxyMaxAmountRateRange.expectedRate).decimalPlaces(0);
//        console.log('ccc');

        //console.log(kyberProxyMaxAmount.toString());
        /*const stablePayMaxAmountRateRange = await this.providerRegistry.getExpectedRateRange(
            sourceTokenAddress,
            targetTokenAddress,
            //kyberProxyMaxAmount.toString()
            BigNumber(kyberProxyMaxAmount.toString()).times(divider)
        );
        console.log('ddd    ');
        console.log(stablePayMaxAmountRateRange);

        const stablePayMaxAmount = amountsCalculator.calculateAmountBased(stablePayMaxAmountRateRange.minRate).decimalPlaces(0);
        const stablePayMinAmount = amountsCalculator.calculateAmountBased(stablePayMaxAmountRateRange.maxRate).decimalPlaces(0);
        */

        this.printRange('Kyber - Unitary Price', kyberProxyUnitaryRateMaxAmount, kyberProxyUnitaryRateMinAmount, kyberProxyUnitaryPriceRateRange.slippageRate,kyberProxyUnitaryPriceRateRange.expectedRate);

        this.printRange('Kyber', kyberProxyMinAmount, kyberProxyMaxAmount, kyberProxyMaxAmountRateRange.slippageRate, kyberProxyMaxAmountRateRange.expectedRate);

        //this.printRange('StablePay', stablePayMinAmount, stablePayMaxAmount, stablePayMaxAmountRateRange.minRate, stablePayMaxAmountRateRange.maxRate);

        const rates = [
            kyberProxyUnitaryPriceRateRange.expectedRate,
            kyberProxyMaxAmountRateRange.slippageRate,
            kyberProxyMaxAmountRateRange.expectedRate/*,
            stablePayMaxAmountRateRange.minRate,
            stablePayMaxAmountRateRange.maxRate*/
        ];

        const amounts = [
            kyberProxyUnitaryRateMaxAmount,
            kyberProxyMaxAmount,
            kyberProxyMinAmount/*,
            stablePayMaxAmount,
            stablePayMinAmount*/
        ];

        const minRate = Math.min(...rates);
        const maxRate = Math.max(...rates);

        const minAmount = Math.min(...amounts);
        const maxAmount = Math.max(...amounts);

        this.printRange('Min/Max', minAmount, maxAmount, minRate, maxRate);

        console.log(`${minAmount}-${maxAmount} ${'SourceToken'} => ${targetTokenAmountInWeis} ${'TargetToken'}`);
        console.log(`${(BigNumber(minAmount.toString())).div(divider).toFixed()}-${(BigNumber(maxAmount.toString())).div(divider).toFixed()} ${'SourceToken'} => ${targetTokenAmount} ${'TargetAmount'}`);

        return {
            minAmount: BigNumber(minAmount.toString()).toFixed(),
            maxAmount: BigNumber(maxAmount.toString()).toFixed(),
            minRate: BigNumber(minRate.toString()).toFixed(),
            maxRate: BigNumber(maxRate.toString()).toFixed()
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