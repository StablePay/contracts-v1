const BigNumber = require('bignumber.js');
// TODO Remove it

class Averager {
    constructor(data) {
        this.data = data;
    }
}

Averager.prototype.getAverage = function(property, safeDigits = 5) {
    const totalCost = this.data.reduce(
        function(state, item){
            const value = item[property];
            if(value) {
                state.total = state.total.plus(new BigNumber(value));
                state.count += 1;
            }
            return state;
        },
        {
            total: new BigNumber(0),
            count: 0
        }
    );
    const average = totalCost
                        .total
                        .div(new BigNumber(safeDigits * 10))
                        .div(totalCost.count)
                        .multipliedBy(new BigNumber(safeDigits * 10));

    return {
        total: totalCost.total,
        count: totalCost.count,
        average: Math.ceil(average)
    };
}

module.exports = Averager;