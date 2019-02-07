class BaseOrderFactory {
    constructor() {
    }
}

BaseOrderFactory.prototype.createOrder = function() {
    throw new Error("Method must be implemented.");
}

module.exports = BaseOrderFactory;