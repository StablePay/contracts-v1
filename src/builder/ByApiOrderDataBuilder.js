const OrderDataBuilder = require('./OrderDataBuilder');
const axios = require('axios');

class ByApiOrderDataBuilder extends OrderDataBuilder {
    constructor(url) {
        super();
        this.url = url;
    }
}

ByApiOrderDataBuilder.prototype.build = async function(data) {
    console.log(`Data `);
    console.log(data);
    const {
        sourceAddress,
        targetAmount,
        targetAddress,
        merchantAddress
    } = data;
    const apiResult = await axios.post(
        this.url, {
        targetAmount: targetAmount,
        sourceTokenAddress: sourceAddress,
        targetTokenAddress: targetAddress,
        merchantAddress: merchantAddress,
        verbose: true,
        safeMargin: "0.000000000"
    });
    const apiResponse = apiResult.data;
    const providersKey = apiResponse.providers.map(provider => provider.providerKey);
    const order = apiResponse.order;
    const amounts = apiResponse.amounts;
    console.log(amounts);
    return {
        order: order,
        providers: providersKey,
        amounts: amounts
    };
}

module.exports = ByApiOrderDataBuilder;