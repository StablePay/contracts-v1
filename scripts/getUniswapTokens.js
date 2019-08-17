/**
    Purpose:
    It gets the expected rate for a specific swapping provider.

    How do I execute this script?

    truffle exec ./scripts/getExpectedRate.js --network infuraRopsten
 */
// Smart contracts
const UniswapFactoryInterface = artifacts.require("./services/uniswap/UniswapFactoryInterface.sol");
const ERC20 = artifacts.require("./services/erc20/ERC20.sol");

// Util classes
const BigNumber = require('bignumber.js');
const assert = require('assert');
const { NULL_ADDRESS } = require('../test/util/consts');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */


module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const uniswapConf = appConf.uniswap;
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;
        const uniswapContracts = uniswapConf.contracts;

        assert(uniswapContracts, "Uniswap contracts is undefined.");

        const factory = await UniswapFactoryInterface.at(uniswapContracts.factory);
        assert(factory, "Factory instance is undefined.");

        const tokensCount = await factory.tokenCount();
        console.log(`Total tokens: ${tokensCount}`);
        const tokens = [];
        let index = 1;
        while( index <= parseInt(tokensCount)) {
            const tokenAddress = await factory.getTokenWithId(index);
            const tokenExchangeAddress = await factory.getExchange(tokenAddress);
            if(tokenAddress === NULL_ADDRESS) {
                index++;
                continue;
            }
            const tokenInstance = await ERC20.at(tokenAddress);

            const decimalsPromise = tokenInstance.decimals();
            const namePromise = tokenInstance.name();
            const symbolPromise = tokenInstance.symbol();

            const [decimals, name, symbol] = await Promise.all([decimalsPromise, namePromise, symbolPromise]);

            console.log(`Token: ${symbol} (${name}) - Decimals: ${decimals} - Address: ${tokenAddress} - Exchange: ${tokenExchangeAddress}.`);

            tokens.push({
                token: {
                    address: tokenAddress,
                    symbol,
                    name,
                    decimals,
                },
                exchange: tokenExchangeAddress,
            });
            index++;
        }

        console.log(tokens);
        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
