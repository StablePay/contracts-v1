/**
    Purpose:
    It gets all tokens and exchanged registered in Uniswap.

    How do I execute this script?

    truffle exec ./scripts/getUniswapTokens.js --network infuraRopsten
 */
// Smart contracts
const UniswapFactoryInterface = artifacts.require("./services/uniswap/UniswapFactoryInterface.sol");
const ERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol");

// Util classes
const jsonfile = require('jsonfile');
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
            let decimals, name, symbol;
            try {
                const tokenAddress = await factory.getTokenWithId(index);
                const tokenExchangeAddress = await factory.getExchange(tokenAddress);
                if(tokenAddress === NULL_ADDRESS) {
                    index++;
                    continue;
                }
                //console.log(`Token address: ${tokenAddress} - Exchange Address: ${tokenExchangeAddress}`);
                const tokenInstance = await ERC20.at(tokenAddress);

                const decimalsPromise = tokenInstance.decimals();
                const namePromise = tokenInstance.name();
                const symbolPromise = tokenInstance.symbol();

                [decimals, name, symbol] = await Promise.all([decimalsPromise, namePromise, symbolPromise]);

                //console.log(`Token: ${symbol} (${name}) - Decimals: ${decimals} - Address: ${tokenAddress} - Exchange: ${tokenExchangeAddress}.`);
                const tokenData = {
                    token: {
                        address: tokenAddress,
                        symbol,
                        name,
                        decimals: parseInt(decimals.toString()),
                    },
                    exchange: tokenExchangeAddress,
                };
                tokens.push(tokenData);
                console.log(index, '- ', tokenData);
                if(index % 20 === 0) {
                    const outputJson = `${index}_uniswap_${network}_tokens.json`;
                    jsonfile.writeFile(outputJson, tokens, {spaces: 4, EOL: '\r\n'}, function (err) {
                        console.log(`Custom JSON file created at '${outputJson}'.`);
                        if(err) {
                            console.error("Errors: " + err);
                        }
                    });
                }
            } catch (error) {
                console.log(`Error on index ${index}: ${symbol} (${name}) - Decimals: ${decimals} - Error: ${error}`);
            }
            index++;
        }
        console.log('='.repeat(100))
        tokens.forEach(tokenData => {
            console.log(tokenData);
        });
        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
