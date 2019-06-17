const OrderDataBuilder = require('./OrderDataBuilder');
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const util = require('ethereumjs-util');
const EMPTY_BYTES_32 = util.bufferToHex(util.setLengthRight(``, 32));
const { BigNumber } = require('bignumber.js');


class UniswapApiOrderDataBuilder extends OrderDataBuilder {
    constructor(url, uniswapProvider, exchange) {
        super();
        this.url = url;
        this.uniswapProvider = uniswapProvider;
        this.exchange = exchange || 'no instance';
    }
}
UniswapApiOrderDataBuilder.prototype.createOrder = function(sourceToken, targetToken ,sourceAmount,targetAmount,merchantAddress,customerAddress) {
    return [
        sourceAmount, //wei
        targetAmount, //wei
        '0', // Amount of makerAsset being offered by maker. Must be greater than 0.
        '0', // Amount of takerAsset being bid on by maker. Must be greater than 0.
        '0', // Amount of ZRX paid to feeRecipient by maker when order is filled. If set to 0, no transfer of ZRX from maker to feeRecipient will be attempted.
        '0', // Amount of ZRX paid to feeRecipient by taker when order is filled. If set to 0, no transfer of ZRX from taker to feeRecipient will be attempted.
        '0', // Timestamp in seconds at which order expires.
        '0', // Arbitrary number to facilitate uniqueness of the order's hash.
        '0',
        '0',

        sourceToken,
        targetToken,
        merchantAddress,
        customerAddress,
        NULL_ADDRESS, // Address that created the order
        NULL_ADDRESS, // Address that is allowed to fill the order. If set to 0, any address is allowed to fill the order.
        NULL_ADDRESS, // Address that will recieve fees when order is filled.
        NULL_ADDRESS, // Address that is allowed to call Exchange contract methods that affect this order. If set to 0, any address is allowed to call these methods.

        EMPTY_BYTES_32, // Signature
        EMPTY_BYTES_32, // Data
        EMPTY_BYTES_32, // Encoded data that can be decoded by a specified proxy contract when transferring makerAsset. The last byte references the id of this proxy.
        EMPTY_BYTES_32 // Encoded data that can be decoded by a specified proxy contract when transferring takerAsset. The last byte references the id of this proxy.
    ];
}

UniswapApiOrderDataBuilder.prototype.build = async function(data) {
    console.log(`Data Uniswap: `);
    console.log(data);
    const {
        sourceAddress,
        targetAmount,
        targetAddress,
        merchantAddress,
        customerAddress
    } = data;

    const providersKey = [
        '0x556e69737761705f763100000000000000000000000000000000000000000000'
    ];
    let costs ;
    if(NULL_ADDRESS === sourceAddress){
        const eth = await  this.exchange.getEthToTokenOutputPrice.call(targetAmount);
        console.log('eth eth', eth);
        costs = ['', eth] ;

    }else{
        costs = await this.uniswapProvider.getExpectedRate.call(sourceAddress, targetAddress, targetAmount);
    }


    const sourceTokensTosell = new BigNumber(costs[1]).toFixed();
    const order = this.createOrder(
        sourceAddress,
        targetAddress,
        sourceTokensTosell,
        targetAmount,
        merchantAddress,
        customerAddress
    );
    const amounts = {sourceTokensTosell,sourceTokensTosell};
    console.log(amounts);
    return {
        order: order,
        providers: providersKey,
        amounts: amounts
    };
}

module.exports = UniswapApiOrderDataBuilder;