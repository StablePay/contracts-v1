/**
    Purpose:
    It gets all the available ERC20 tokens, and transfers a random amount.

    How do I execute this script?

    truffle exec ./scripts/massiveTransferWithTokens.js --network infuraRopsten
 */
// Smart contracts
const appConfig = require('../src/config');
const IStablePay = artifacts.require("./interface/IStablePay.sol");
const ERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol");

// Util classes
const { ETH_ADDRESS } = require('../test/util/consts');
const BigNumber = require('bignumber.js');
const axios = require('axios');
const assert = require('assert');
const ProviderKeyGenerator = require('../src/utils/ProviderKeyGenerator');
const providerKeyGenerator = new ProviderKeyGenerator();
const ProcessArgs = require('../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();

/**
    Script Arguments
 */
const unavailableTokens = [
    'RCN',
    'LINK',
    'STORM',
    'COFI',
    'BITX',
    'MOC',
    'MAS',
    'SPN',
    'HKN'
];
const DAI_NAME = 'DAI';
const merchantAddressIndex = 1;
const customerAddressIndex = 0;
const minAmount = 10;
const maxAmount = 25;

module.exports = async (callback) => {
    try {
        assert(minAmount < maxAmount, "Min amount must be < than max Amount.");
        const accounts = await web3.eth.getAccounts();
        assert(accounts, "Accounts must be defined.");
        const merchantAddress = accounts[merchantAddressIndex];
        const customerAddress = accounts[customerAddressIndex];

        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
        const appConf = require('../config')(network);
        const networkName = appConf.network;
        const maxGasForDeploying = appConf.maxGas;
        const stablepayConf = appConf.stablepay;
        const stablepayContracts = stablepayConf.contracts;
        const kyberConf = appConf.kyber;
        const kyberTokens = kyberConf.tokens;
        
        const tokensUrl = `${appConfig.getStablePayApiUrl().get()}/tokens?network=${networkName}`;
        assert(tokensUrl, 'Tokens URL is undefined.');
        const ordersUrl = `${appConfig.getStablePayApiUrl().get()}/orders?network=${networkName}`;
        assert(ordersUrl, 'Orders URL is undefined.');
        //console.log(tokensUrl);

        const result = await axios.get(tokensUrl);
        const tokens = result.data;
        console.log(`${tokens.length} tokens.`);

        const targetTokenInstance = await ERC20.at(kyberTokens[DAI_NAME]);
        assert(targetTokenInstance, 'Target token instance is undefined.');
        const tokenDecimals = await targetTokenInstance.decimals();
        const decimalsPow = (new BigNumber(10)).pow(tokenDecimals);
        

        for (const token of tokens) {
            console.log('\n', `-`.repeat(100));
            console.log(`Testing token => ${token.address} - ${token.decimals} - ${token.symbol}`);

            const targetAmount = Math.floor( (Math.random() * (maxAmount - minAmount) )+ minAmount);
            const targetAmountWei = BigNumber(targetAmount).times(decimalsPow).toFixed();
            let swapMessage = undefined;
            try {
                assert(!unavailableTokens.includes(token.symbol), `Pair ${token.symbol}-${DAI_NAME} is temporarily under maintenance.`);
                const createOrderResult = await axios.post(
                    ordersUrl, {
                    targetAmount: targetAmount,
                    sourceTokenAddress: token.address,
                    targetTokenAddress: targetTokenInstance.address,
                    merchantAddress: merchantAddress,
                    customerAddress: customerAddress,
                    verbose: true,
                    safeMargin: "0.000000000"
                });
                const { order, providers } = createOrderResult.data;
                const sourceTokenRequiredBalance = BigNumber(order[0].toString()).toFixed();

                console.log(`Swapping process will use ${providerKeyGenerator.fromBytes(providers[0])}`);

                swapMessage = `${sourceTokenRequiredBalance} ${token.symbol} => ${targetAmountWei} ${DAI_NAME}`;

                let sourceTokenInstance;
                let customerBalance;
                if(ETH_ADDRESS === token.address) {
                    sourceTokenInstance = token.address;
                    customerBalance = await web3.eth.getBalance(customerAddress);
                } else {
                    sourceTokenInstance = await ERC20.at(token.address);
                    customerBalance = await sourceTokenInstance.balanceOf(customerAddress);
                }

                const customerHasBalance = BigNumber(customerBalance.toString()).gte(sourceTokenRequiredBalance);
                console.log(`Enough balance of ${token.symbol}?. ${customerHasBalance} : Current: ${customerBalance.toString()}. Required: ${sourceTokenRequiredBalance.toString()}`);
                assert(customerHasBalance, `Not enough source token ${token.symbol} balance.`);
                
                console.log(`${swapMessage}`);
                const stablePayInstance = await IStablePay.at(stablepayContracts.StablePay);
                assert(stablePayInstance, 'StablePay instance is undefined.');
                
                let transferWithResult;
                if(ETH_ADDRESS !== token.address) {
                    const approveResult = await sourceTokenInstance.approve(stablePayInstance.address, sourceTokenRequiredBalance, { from: customerAddress });
                    assert(approveResult, 'Approve is undefined.');
                    transferWithResult = await stablePayInstance.transferWithTokens(order, providers, {from: customerAddress, gas: maxGasForDeploying});
                } else {
                    transferWithResult = await stablePayInstance.transferWithEthers(order, providers, {from: customerAddress, value: sourceTokenRequiredBalance, gas: maxGasForDeploying});
                }
                assert(transferWithResult, 'TransferWith result is undefined.');

                const etherscanUrlPrefix = networkName.toLowerCase() === 'ropsten' ? networkName : 'www';
                console.log(`Success ${swapMessage}: https://${etherscanUrlPrefix}.etherscan.io/tx/${transferWithResult.tx}`);
            } catch (error) {
                console.log(`Error ${swapMessage} : ${error.toString()}`);
                console.log(`Error on ${token.name}=>${DAI_NAME} stablePayStorage.getExpectedRates(${token.address} (${token.symbol}), ${targetTokenInstance.address} (${DAI_NAME}), ${targetAmountWei});`)
            }
        }

        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
};
