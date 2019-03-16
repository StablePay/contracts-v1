const _ = require('lodash');
const leche = require('leche');
const withData = leche.withData;
const uniswap = require('./uniswap');
const BigNumber = require('bignumber.js');


const exchange = artifacts.require("./uniswap/UniswapExchangeInterface.sol");
const factory = artifacts.require("./uniswap/UniswapFactoryInterface.sol");

const Token1 = artifacts.require("./erc20/EIP20.sol");
const Token2 = artifacts.require("./erc20/EIP20.sol");

const t = require('../util/TestUtil').title;


const supply = web3.utils.toBN(new BigNumber(10000000000000000000000000000000000000000000000000000000000000000000000000000000000000000));
const approved = web3.utils.toBN(new BigNumber(10000000000000000000000000000000000000000000000000000));
const initialLiquidity = web3.utils.toBN(new BigNumber(10000000000000000000000000000000000000000));

// const Web3 = require('web3');
//
// const web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"));

contract('deploy', function (accounts) {
    const owner = accounts[0];
    //console.log('fff', factory);

    let uniswapFactory;
    let exchangeTemplate;

    let token1;
    let token2;

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

        let templ =  await uniswapFactory.exchangeTemplate.call();
        console.log('ttt', templ);
        token1 = await Token1.new(supply, "a", 18, "A");
        token2 = await Token2.new(supply, "b", 18, "B");
        console.log('token1 =>>>', token1.address);
        console.log('token2 =>>>', token2.address);


        assert.equal(await uniswapFactory.tokenCount(), 0);

        await uniswapFactory.createExchange(token1.address);

        assert.equal(await uniswapFactory.tokenCount(), 1);

        token1ExchangeAddress = await uniswapFactory.getExchange(token1.address);
        token1Exchange = await exchange.at(token1ExchangeAddress);
        console.log('token1Exchange =>>>', token1ExchangeAddress);
        console.log('token1Exchange =>>>', await token1Exchange.factoryAddress());
        await token1.approve(token1ExchangeAddress, approved);

        const initialLiquidity = web3.utils.toBN(new BigNumber(10000000000000000000000000000000000000000));
        const current_block = await web3.eth.getBlock(await web3.eth.getBlockNumber());
        //console.log('getEthToTokenOutputPrice =>>>', await token1Exchange.getEthToTokenOutputPrice(1000000000));
        await token1Exchange.addLiquidity(initialLiquidity, initialLiquidity, current_block.timestamp + 300, {value:100000000000000});
        console.log('getEthToTokenOutputPrice =>>>', await token1Exchange.getEthToTokenOutputPrice(1000000000));


    });

    withData({
        _1_: [false],

    }, function(mustFail) {
        it(t('owner', 'deploy', 'Should be able to deploy.', mustFail), async function() {
            // Setup
            console.log('=== =>>>', uniswapFactory.address)
            console.log('=== =>>>', exchangeTemplate.address)
        });
    });
});