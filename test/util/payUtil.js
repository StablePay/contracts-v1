const Web3 = require('web3');
const BigNumber = require('bignumber.js');
const AmountsCalculator = require('./expectedRate/AmountsCalculator');

const ETH_ADDRESS = '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee';
const web3 = new Web3();

module.exports = {
    getBalances: async function (address, ...erc20s) {
        const balances = {
            address: address,
            tokens: new Map()
        };
        for (const erc20 of erc20s) {
            if(erc20.instance.address === ETH_ADDRESS) {
                balances.tokens.set('ETH', await web3.eth.getBalance(address));
            } else {
                balances.tokens.set(erc20.name, await erc20.instance.balanceOf(address));
            }
        }
        return balances;
    },
    printBalance: function (who, initialBalances, finalBalances, printBalances = false) {
        const resultBalances = new Map();
        for (var tokenNameInitialTokenBalance of initialBalances.tokens.entries()) {
            const tokenName = tokenNameInitialTokenBalance[0];
            const initialTokenBalance = tokenNameInitialTokenBalance[1];

            const finalTokenBalance = finalBalances.tokens.get(tokenName);
            const result = new BigNumber(finalTokenBalance).minus(new BigNumber(initialTokenBalance)).toNumber();

            if(printBalances === true) {
                console.log(`${who.padEnd(10)} ${tokenName.padEnd(4)}: ${initialTokenBalance}    ->  ${finalTokenBalance} = ${result}`);
            }
            
            resultBalances.set(tokenName, new BigNumber(result.toString()));
        }
        return resultBalances;
    },
    printBalanceOf: function (who, token, initial, final) {
        const result = new BigNumber(final).minus(new BigNumber(initial)).toNumber();
        console.log(`${who.padEnd(10)} ${token.padEnd(4)}: ${initial}    ->  ${final} = ${result}`);
        return new BigNumber(result.toString());
    }
};