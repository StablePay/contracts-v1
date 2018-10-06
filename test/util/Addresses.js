require('dotenv').config();

module.exports = {
    EXCHANGE: process.env["EXCHANGE"],
    ZRXTOKEN: process.env["ZRXTOKEN"],
    DUMMYERC20TOKEN1:process.env["DUMMYERC20TOKEN1"],
    DUMMYERC20TOKEN2:process.env["DUMMYERC20TOKEN2"],
    WETH9:process.env["WETH9"],
    ASSETPROXYOWNER:process.env["ASSETPROXYOWNER"],
    ERC20PROXY:process.env["ERC20PROXY"],
}