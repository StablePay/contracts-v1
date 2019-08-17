/**
    Purpose:
    It adds liquidity to a specific uniswap exchange.

    How do I execute this script?

    truffle exec ./scripts/addOrCreateLiquidityUniswapExchange.js --network infuraRopsten
 */
// Smart contracts
const IProviderRegistry = artifacts.require("./interface/IProviderRegistry.sol");
const ERC20 = artifacts.require("./services/erc20/ERC20.sol");
const UniswapFactoryInterface = artifacts.require("./services/uniswap/UniswapFactoryInterface.sol");
const UniswapExchangeInterface = artifacts.require("./services/uniswap/UniswapExchangeInterface.sol");

// Util classes
const BigNumber = require('bignumber.js');
const assert = require('assert');
const { NULL_ADDRESS } = require('../test/util/consts');
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

const printExchangeInfo = async (title, tokenExchangeInstance, tokenInstance, web3) => {
    const tokenDecimals = await tokenInstance.decimals();
    assert(tokenDecimals, "Token decimals is undefined.");

    const exchangeEtherBalanceWei = await web3.eth.getBalance(tokenExchangeInstance.address);
    const exchangeTokenBalanceWei = await tokenInstance.balanceOf(tokenExchangeInstance.address);

    console.log(`\nPool Details: ${title}`);
    console.log('-'.repeat(20),'\n');
    const exchangeEtherBalanceEther = web3.utils.fromWei(exchangeEtherBalanceWei, 'ether');
    const exchangeTokenBalanceToken = BigNumber(exchangeTokenBalanceWei.toString()).div(10 ** parseInt(tokenDecimals.toString()));
    console.log(`Ether Balance: ${exchangeEtherBalanceEther} ETH`);
    console.log(`Token Balance: ${exchangeTokenBalanceToken} ${tokenName}`);

    const etherTokenRate = exchangeTokenBalanceToken.div(BigNumber(exchangeEtherBalanceEther.toString()));
    console.log(`Exchange Rate: 1 ETH = ${etherTokenRate} ${tokenName}`);
}

/**
    Script Arguments
 */
const senderIndex = 0;
const tokenName = 'DAI_COMPOUND';
const addLiquidity = true;
const tokensLiquidity = 150;
const etherLiquidity = 1;
const deadline = '1742680400';

module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const kyberConf = appConf.kyber;
        const uniswapConf = appConf.uniswap;

        const uniswapConfContracts = uniswapConf.contracts;
        const tokens = kyberConf.tokens;
        const tokenAddress = tokens[tokenName];
        
        assert(tokenAddress, "Source token is undefined.");
        
        const tokenInstance = await ERC20.at(tokenAddress);
        assert(tokenInstance, "Token instance is undefined.");
        assert(tokenInstance.address, "Token address is undefined.");

        const tokenDecimals = await tokenInstance.decimals();
        assert(tokenDecimals, "Token decimals is undefined.");

        const uniswapFactory = await UniswapFactoryInterface.at(uniswapConfContracts.factory);
        assert(uniswapFactory, "Uniswap factory instance is undefined.");
        assert(uniswapFactory.address, "Uniswap factory instance is undefined.");

        let sourceTokenExchangeAddress = await uniswapFactory.getExchange(tokenAddress);
        assert(sourceTokenExchangeAddress, "Token exchange address is undefined.");
        if(sourceTokenExchangeAddress === NULL_ADDRESS) {
            console.log(`Uniswap exchange not found for token ${tokenAddress} (${tokenName}). It will be created.`);
            const createExchangeResult = await uniswapFactory.createExchange(tokenAddress);
            assert(createExchangeResult, "Token exchange result is undefined.");

            sourceTokenExchangeAddress = await uniswapFactory.getExchange(tokenAddress);
            assert(sourceTokenExchangeAddress, "New token exchange created address is undefined.");
            console.log(`Exchange created ${sourceTokenExchangeAddress} for token ${tokenAddress} (${tokenName}).`);
        } else {
            console.log(`Uniswap exchange already exist ${sourceTokenExchangeAddress} for token ${tokenAddress} (${tokenName}).`);
        }
        const tokenExchangeInstance = await UniswapExchangeInterface.at(sourceTokenExchangeAddress);
        assert(tokenExchangeInstance, "Token exchange instance is undefined.");
        assert(tokenExchangeInstance.address, "Token exchange address instance is undefined.");

        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");

        const sender = accounts[senderIndex];
        assert(sender, "Sender is undefined.");

        if(addLiquidity) {
            await printExchangeInfo('Before Adding Liquidity', tokenExchangeInstance, tokenInstance, web3);
            
            console.log(`\n\nAdding liquidity to: Exchange ${sourceTokenExchangeAddress} / Token ${tokenAddress} (${tokenName}).`);
            console.log(`Ether: ${etherLiquidity} ETH`);
            console.log(`Token: ${tokensLiquidity} ${tokenName}`);
            
            const liquidityEtherWei = web3.utils.toWei(etherLiquidity.toString(), 'ether');
            const liquidityTokenWei = BigNumber(tokensLiquidity.toString()).times(10 ** parseInt(tokenDecimals.toString()));

            const approveResult = await tokenInstance.approve(tokenExchangeInstance.address, liquidityTokenWei, {from: sender});
            assert(approveResult, 'Approve result is undefined.');

            const addLiquidityResult = await tokenExchangeInstance.addLiquidity(
                liquidityEtherWei,
                liquidityTokenWei,
                deadline, {
                    from: sender,
                    value: liquidityEtherWei
                }
            );
            assert(addLiquidityResult, 'Add liquidity result is undefined.');

            await printExchangeInfo('After Adding Liquidity', tokenExchangeInstance, tokenInstance, web3);
        }

        await printExchangeInfo(`ETH / ${tokenName}`, tokenExchangeInstance, tokenInstance, web3);

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
