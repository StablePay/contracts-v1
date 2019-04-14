
const logIf = function(verbose, message) {
    if(verbose) {
        console.log(message);
    }
}

class StablePayWrapper  {
    constructor(stablePay, orderDataBuilder, sourceErc20, verbose = true) {
        this.stablePay = stablePay;
        this.orderDataBuilder = orderDataBuilder;
        this.verbose = verbose;
        this.sourceErc20 = sourceErc20;
    }
}

StablePayWrapper.prototype.payWithToken = async function(data, ...params) {
    const { order, providers, amounts } = await this.orderDataBuilder.build(data);
    try {
        console.log(`Params:    ${JSON.stringify(params)}`);
        const calculatedSourceAmount = order[0];

        if(data.sourceAddress === data.targetAddress) {
            const targetAmount = order[1];
            await this.sourceErc20.approve(
                this.stablePay.address,
                targetAmount,
                ...params
            );
        } else {
            await this.sourceErc20.approve(
                this.stablePay.address,
                calculatedSourceAmount,
                ...params
            );
        }

        //logIf(this.verbose, '------------------------------------------------');
        //logIf(this.verbose, `Execution: ${message}`);
        logIf(this.verbose, '------------------------------------------------');
        logIf(this.verbose, `Source Amount:         ${calculatedSourceAmount}.`);
        logIf(this.verbose, `Target Amount:         ${order[1]}.`);
        logIf(this.verbose, `Min. Rate:             ${order[8]}.`);
        logIf(this.verbose, `Max. Rate:             ${order[9]}.`);
        logIf(this.verbose, `Source Token:          ${order[10]}.`);
        logIf(this.verbose, `Target Token:          ${order[11]}.`);
        logIf(this.verbose, `Merchant Address:      ${order[12]}.`);
        //logIf(this.verbose, `Customer Address:      ${params}.`);

        const result = await this.stablePay.payWithToken(order, providers, ...params);
        // Assertions
        assert(result);

        logIf(this.verbose, `TX Success:    https://ropsten.etherscan.io/tx/${result.tx}`);
        logIf(this.verbose, `Gas Used:      ${result.receipt.gasUsed}.`);
        for (const log of result.logs) {
            logIf(this.verbose, `Log`);
            logIf(this.verbose, log);
        }
        logIf(this.verbose, '------------------------------------------------');
        return {
            result: result,
            tx: {
                hash: result.tx,
                gasUsed: result.receipt.gasUsed
            },
            success: true,
            error: undefined,
            amounts: amounts,
            order: order,
            providers: providers
        };
    } catch (error) {
        logIf(this.verbose, `Error trading tokens.`);
        logIf(this.verbose, error);
        logIf(this.verbose, '------------------------------------------------');
        return {
            result: undefined,
            tx: undefined,
            success: false,
            error: error,
            amounts: amounts,
            order: order,
            providers: providers
        };
    }
}

StablePayWrapper.prototype.payWithEther = async function(data, ...params) {
    const { order, providers, amounts } = await this.orderDataBuilder.build(data);
    try {
        console.log(`Params:    ${JSON.stringify(params)}`);
        const calculatedSourceAmount = order[0];

        //logIf(this.verbose, '------------------------------------------------');
        //logIf(this.verbose, `Execution: ${message}`);
        logIf(this.verbose, '------------------------------------------------');
        logIf(this.verbose, `Source Amount:         ${calculatedSourceAmount}.`);
        logIf(this.verbose, `Target Amount:         ${order[1]}.`);
        logIf(this.verbose, `Min. Rate:             ${order[8]}.`);
        logIf(this.verbose, `Max. Rate:             ${order[9]}.`);
        logIf(this.verbose, `Source Token:          ${order[10]}.`);
        logIf(this.verbose, `Target Token:          ${order[11]}.`);
        logIf(this.verbose, `Merchant Address:      ${order[12]}.`);
        logIf(this.verbose, `Params:                ${JSON.stringify(params)}.`);

        const result = await this.stablePay.payWithEther(order, providers, {
            from: params[0].from,
            gas: params[0].gas,
            value: calculatedSourceAmount
        });
        // Assertions
        assert(result);

        logIf(this.verbose, `TX Success:    https://ropsten.etherscan.io/tx/${result.tx}`);
        logIf(this.verbose, `Gas Used:      ${result.receipt.gasUsed}.`);
        for (const log of result.logs) {
            logIf(this.verbose, `Log`);
            logIf(this.verbose, log);
        }
        logIf(this.verbose, '------------------------------------------------');
        return {
            result: result,
            tx: {
                hash: result.tx,
                gasUsed: result.receipt.gasUsed
            },
            success: true,
            error: undefined,
            amounts: amounts,
            order: order,
            providers: providers
        };
    } catch (error) {
        logIf(this.verbose, `Error trading tokens.`);
        logIf(this.verbose, error);
        logIf(this.verbose, '------------------------------------------------');
        return {
            result: undefined,
            tx: undefined,
            success: false,
            error: error,
            amounts: amounts,
            order: order,
            providers: providers
        };
    }
}

module.exports = StablePayWrapper;