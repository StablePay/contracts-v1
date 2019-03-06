class OrderDataBuilder {
    constructor() {
    }
}

OrderDataBuilder.prototype.build = async function(data) {
    const {
        sourceAddress,
        targetAmount,
        targetAddress,
        merchantAddress
    } = data;
    throw new Error(`Implement 'build' method.`);
}

module.exports = OrderDataBuilder;