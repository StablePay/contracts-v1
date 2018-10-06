const {
    assetDataUtils,
    BigNumber,
    generatePseudoRandomSalt,
    orderHashUtils,
    signatureUtils,
    SignerType,
} = require('0x.js');
const _ = require('lodash');
const { ONE_SECOND_MS, TEN_MINUTES_MS, DECIMALS } =  require('./constants');
const { toBaseUnitAmount } =  require('./tokenUtil');

/**
 * Returns an amount of seconds that is greater than the amount of seconds since epoch.
 */
const getRandomFutureDateInSeconds = () => {
    return new BigNumber(Date.now() + TEN_MINUTES_MS).div(ONE_SECOND_MS).ceil();
};


const getExpirationTime = (hours) => {
    return new BigNumber(Date.now() + (hours * 60)).div(ONE_SECOND_MS).ceil();
};

// order = {
//     exchangeAddress,
//     makerAddress: maker,
//     takerAddress: NULL_ADDRESS,
//     senderAddress: NULL_ADDRESS,
//     feeRecipientAddress: NULL_ADDRESS,
//     expirationTimeSeconds: expiration,
//     makerAssetAmount,
//     takerAssetAmount,
//     erc20MakerAddress,
//     erc20TakerAddress,
//     makerFee: ZERO,
//     takerFee: ZERO,
// };

const createOrder = async (order, providerEngine) => {
    const finalOrder = _.pickBy(order, function(value, key) {
        return (key !== "erc20MakerAddress") || (key !== "erc20TakerAddress");
    });

    finalOrder.makerAssetData = assetDataUtils.encodeERC20AssetData(order.erc20MakerAddress);
    finalOrder.takerAssetData = assetDataUtils.encodeERC20AssetData(order.erc20TakerAddress);

    // Extract it to a library tokenUtil.js
    finalOrder.makerAssetAmount =  toBaseUnitAmount(finalOrder.makerAssetAmount, DECIMALS);
    finalOrder.takerAssetAmount =  toBaseUnitAmount(finalOrder.takerAssetAmount, DECIMALS);
    finalOrder.salt = generatePseudoRandomSalt();

    const orderHashHex = orderHashUtils.getOrderHashHex(finalOrder);
    const signature = await signatureUtils.ecSignOrderHashAsync(
        providerEngine,
        orderHashHex,
        finalOrder.makerAddress,
        SignerType.Default,
    );

    const {
        makerAddress,
        takerAddress,           // Address that is allowed to fill the order. If set to 0, any address is allowed to fill the order.
        feeRecipientAddress,    // Address that will recieve fees when order is filled.
        senderAddress,         // Address that is allowed to call Exchange contract methods that affect this order. If set to 0, any address is allowed to call these methods.
        makerAssetAmount,     // Amount of makerAsset being offered by maker. Must be greater than 0.
        takerAssetAmount,       // Amount of takerAsset being bid on by maker. Must be greater than 0.
        makerFee,             // Amount of ZRX paid to feeRecipient by maker when order is filled. If set to 0, no transfer of ZRX from maker to feeRecipient will be attempted.
        takerFee,              // Amount of ZRX paid to feeRecipient by taker when order is filled. If set to 0, no transfer of ZRX from taker to feeRecipient will be attempted.
        expirationTimeSeconds,  // Timestamp in seconds at which order expires.
        salt,                   // Arbitrary number to facilitate uniqueness of the order's hash.
        makerAssetData,         // Encoded data that can be decoded by a specified proxy contract when transferring makerAsset. The last byte references the id of this proxy.
        takerAssetData
    } = finalOrder;

    const orderArray = [
        makerAddress,
        takerAddress,           // Address that is allowed to fill the order. If set to 0, any address is allowed to fill the order.
        feeRecipientAddress,    // Address that will recieve fees when order is filled.
        senderAddress,         // Address that is allowed to call Exchange contract methods that affect this order. If set to 0, any address is allowed to call these methods.
        makerAssetAmount.toString(),     // Amount of makerAsset being offered by maker. Must be greater than 0.
        takerAssetAmount.toString(),       // Amount of takerAsset being bid on by maker. Must be greater than 0.
        makerFee.toString(),             // Amount of ZRX paid to feeRecipient by maker when order is filled. If set to 0, no transfer of ZRX from maker to feeRecipient will be attempted.
        takerFee.toString(),              // Amount of ZRX paid to feeRecipient by taker when order is filled. If set to 0, no transfer of ZRX from taker to feeRecipient will be attempted.
        expirationTimeSeconds.toString(),  // Timestamp in seconds at which order expires.
        salt.toString(),                   // Arbitrary number to facilitate uniqueness of the order's hash.
        makerAssetData,         // Encoded data that can be decoded by a specified proxy contract when transferring makerAsset. The last byte references the id of this proxy.
        takerAssetData
    ]

    return { order: finalOrder, signature, orderArray };
}


module.exports = {
    createOrder,
    getRandomFutureDateInSeconds,
    getExpirationTime
}