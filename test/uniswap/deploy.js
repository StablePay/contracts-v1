const _ = require('lodash');
const leche = require('leche');
const uniswap = require('./uniswap');
const BigNumber = require('bignumber.js');


const exchange = artifacts.require("./services/uniswap/UniswapExchangeInterface.sol");
const factory = artifacts.require("./services/uniswap/UniswapFactoryInterface.sol");

const Token1 = artifacts.require("./services/erc20/EIP20.sol");
const Token2 = artifacts.require("./services/erc20/EIP20.sol");

const DECIMALS = (new BigNumber(10)).pow(18);
const supply =  (new BigNumber(10).pow(10)).times(DECIMALS).toFixed();
const approved = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();
const initialLiquidity = (new BigNumber(10).pow(8)).times(DECIMALS).toFixed();

contract('deploy', function (accounts) {
    const owner = accounts[0];

    let uniswapFactory;
    let exchangeTemplate;

    let token1;

    let token1ExchangeAddress;
    let token1Exchange;
    beforeEach('Setup contract for each test', async () => {
        let factoryABI = new web3.eth.Contract(JSON.parse(uniswap.factory.abi));
        let exchangeBI = new web3.eth.Contract(JSON.parse(uniswap.exchange.abi));

        const factoryResult = await factoryABI.deploy({
            data: uniswap.factory.bytecode
        })
        .send({
            from: owner,
            gas: 1500000,
            gasPrice: 90000 * 2
        });


        uniswapFactory = await factory.at(factoryResult.options.address);

        const exchangeTemplateResult = await exchangeBI.deploy({
            data: uniswap.exchange.bytecode
        })
            .send({
                from: owner,
                gas: 5500000,
                gasPrice: 90000 * 2
            });

        exchangeTemplate = await exchange.at(exchangeTemplateResult.options.address);

        await uniswapFactory.initializeFactory(exchangeTemplate.address, {from: owner});
        
        token1 = await Token1.new(supply, "a", 18, "A");
        token2 = await Token2.new(supply, "b", 18, "B");

        assert.equal(await uniswapFactory.tokenCount(), 0);

        await uniswapFactory.createExchange(token1.address);

        assert.equal(await uniswapFactory.tokenCount(), 1);

        token1ExchangeAddress = await uniswapFactory.getExchange(token1.address);
        token1Exchange = await exchange.at(token1ExchangeAddress);
        
        await token1.approve(token1ExchangeAddress, approved);

        const current_block = await web3.eth.getBlock(await web3.eth.getBlockNumber());
        await token1Exchange.addLiquidity(initialLiquidity, initialLiquidity, current_block.timestamp + 300, {value:100000000000000});
    });
});