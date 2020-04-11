/**
    Purpose:
    It gets the expected rate for a specific swapping provider.
​
    How do I execute this script?
​
    truffle exec ./scripts/getExpectedRate.js --network infuraRopsten
 */
// Smart contracts
const ERC20 = artifacts.require("./services/erc20/ERC20.sol");
​
// Util classes
const BigNumber = require('bignumber.js');
const {
    getBalance,
    getToken,
    transfer,
} = require('../utils/tokens');
const assert = require('assert');
const ProcessArgs = require('../../src/utils/ProcessArgs');
const processArgs = new ProcessArgs();
​
/**
    Script Arguments
 */
const verbose = true;
const TOKEN_NAME = 'WETH';
const DAI_ADDRESS = '0x6b175474e89094c44da98b954eedeac495271d0f';
// ETH whale
const unlockedAccount = '0x742d35cc6634c0532925a3b844bc454e4438f44e';
// DAI whale
const DAI_WHALE = '0xe092436d60dd92170326b7782ea8d393cf67941d';
const receiverIndex = 0;
const amount = '10'; // WETH
​
module.exports = async (callback) => {
    try {
        const network = processArgs.network();
        console.log(`Script will be executed in network ${network}.`)
​
        const accounts = await web3.eth.getAccounts();
        assert(accounts, 'Accounts is undefined.');
​
        const receiver = accounts[receiverIndex];
        assert(receiver, 'Receiver is undefined.');
​
        const amountWei = BigNumber(amount.toString()).times(10 ** 18);
        //await receiver.transfer({ from: unlockedAccount, value: amountWei });
        await web3.eth.sendTransaction({from: unlockedAccount, to:receiver, value: amountWei});
​
//         const daiTokenAddress = DAI_ADDRESS;
//         assert(daiTokenAddress, 'DAI token address is undefined.');
//         ​
//         const daiToken = await ERC20.at(daiTokenAddress);
//         assert(daiToken, 'DAI token is undefined.');
//         ​
//         const initialBalanceAssetToken = await daiToken.balanceOf(sender);
//         console.log(`Initial Balance DAI Token: ${initialBalanceAssetToken.toString()}`);
// ​
//         const initialBalanceWhaleAssetToken = await daiToken.balanceOf(DAI_WHALE);
//         console.log(`Initial Balance DAI Token for DAI WHALE: ${initialBalanceAssetToken.toString()}`);

//         // await daiToken.transfer()
// ​
// ​        const finalBalanceDaiToken = await daiToken.balanceOf(sender);
//         console.log(`Final Balance DAI Token: ${finalBalanceDaiToken.toString()}`);


        console.log('>>>> The script finished successfully. <<<<');
        callback();
    } catch (error) {
        console.log(error);
        callback(error);
    }
}
