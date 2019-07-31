const BigNumber = require('bignumber.js');

class Amount {
    constructor(value, decimals = 0) {
        this.value = value.toString();
        this.decimals = decimals;
    }
}

Amount.prototype.aUnit = function() {
    return (new BigNumber(10)).pow(this.decimals);
}

Amount.prototype.asWeis = function() {
    const aUnit = this.aUnit();
    const unit = BigNumber(this.value).times(aUnit);
    return unit;
}

Amount.prototype.asWeisFixed = function() {
    return this.asWeis().toFixed();
}

Amount.prototype.plus = function(value) {
    const currentValue = BigNumber(this.asWeisFixed());
    const result = currentValue.plus(BigNumber(value.toString()));
    return new Amount(result.toFixed());
}

module.exports = Amount;