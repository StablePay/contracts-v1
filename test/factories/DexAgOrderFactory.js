const { NULL_ADDRESS } =require('../util/consts');
const util = require('ethereumjs-util');
const BaseOrderFactory = require('./BaseOrderFactory');
const EMPTY_BYTES_32 = util.bufferToHex(util.setLengthRight(``, 32));
const EMPTY_BYTES_STRING = util.bufferToHex(util.setLengthRight(``, 0));

class DexAgOrderFactory extends BaseOrderFactory {

    constructor(data) {
        super();
        const {
            sourceToken,
            targetToken,
            sourceAmount,
            targetAmount,
            minRate,
            maxRate,
            merchantAddress,
            customerAddress,
            postActionAddress,
            bytesData,
        } = data;
        this.sourceToken = sourceToken;
        this.targetToken = targetToken;
        this.sourceAmount = sourceAmount;
        this.targetAmount = targetAmount;
        this.minRate = minRate;
        this.maxRate = maxRate;
        this.merchantAddress = merchantAddress;
        this.customerAddress = customerAddress;
        this.postActionAddress = postActionAddress || NULL_ADDRESS;
        this.data = bytesData || EMPTY_BYTES_STRING;
    }
}

DexAgOrderFactory.prototype.createOrder = function() {
    return [
        this.sourceAmount,
        this.targetAmount,
        '0', // Amount of makerAsset being offered by maker. Must be greater than 0.
        '0', // Amount of takerAsset being bid on by maker. Must be greater than 0.
        '0', // Amount of ZRX paid to feeRecipient by maker when order is filled. If set to 0, no transfer of ZRX from maker to feeRecipient will be attempted.
        '0', // Amount of ZRX paid to feeRecipient by taker when order is filled. If set to 0, no transfer of ZRX from taker to feeRecipient will be attempted.
        '0', // Timestamp in seconds at which order expires.
        '0', // Arbitrary number to facilitate uniqueness of the order's hash.
        this.minRate,
        this.maxRate,

        this.sourceToken,
        this.targetToken,
        this.merchantAddress,
        this.customerAddress,
        NULL_ADDRESS, // Address that created the order
        NULL_ADDRESS, // Address that is allowed to fill the order. If set to 0, any address is allowed to fill the order.
        NULL_ADDRESS, // Address that will recieve fees when order is filled.
        NULL_ADDRESS, // Address that is allowed to call Exchange contract methods that affect this order. If set to 0, any address is allowed to call these methods.
        this.postActionAddress,

        EMPTY_BYTES_32, // Signature
        this.data, // Data
        EMPTY_BYTES_32, // Encoded data that can be decoded by a specified proxy contract when transferring makerAsset. The last byte references the id of this proxy.
        EMPTY_BYTES_32 // Encoded data that can be decoded by a specified proxy contract when transferring takerAsset. The last byte references the id of this proxy.
    ];
}

module.exports = DexAgOrderFactory;