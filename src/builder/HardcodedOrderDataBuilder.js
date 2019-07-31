const OrderDataBuilder = require('./OrderDataBuilder');
const { NULL_ADDRESS } =require('../../test/util/consts');

class HardcodedOrderDataBuilder extends OrderDataBuilder {
    constructor() {
        super();
    }
}

HardcodedOrderDataBuilder.prototype.build = async function(data) {
    const {
        sourceAmount,
        targetAmount,
        minRate,
        maxRate,
        sourceToken,
        targetToken,
        merchantAddress,
        customerAddress,
        providerKey,
        postActionAddress
    } = data;

    const order = [
        sourceAmount,
        targetAmount,
        '0',
        '0',
        '0',
        '0',
        '0',
        '0',
        minRate,
        maxRate,
        sourceToken,
        targetToken,
        merchantAddress,
        customerAddress,
        postActionAddress || NULL_ADDRESS,

        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        '0x0000000000000000000000000000000000000000000000000000000000000000'
    ];
    return {
        order: order,
        providers: [providerKey]
    };
}

module.exports = HardcodedOrderDataBuilder;