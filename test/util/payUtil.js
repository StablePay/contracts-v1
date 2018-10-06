module.exports = {
    printBalanceOf: function (who, token, initial, final) {
        console.log(`${who.padEnd(10)} ${token.padEnd(4)}: ${initial}    ->  ${final} = ${new BigNumber(final).sub(new BigNumber(initial)).toNumber()}`);
    }
};