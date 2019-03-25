pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "./ISwappingProvider.sol";
import "../erc20/ERC20.sol";
import "../uniswap/UniswapExchangeInterface.sol";
import "../uniswap/UniswapFactoryInterface.sol";
import "../util/StablePayCommon.sol";
import "../util/SafeMath.sol";

/**
    @dev Stable Pay uniswap provider.
 */
contract UniswapSwappingProvider is ISwappingProvider {

    address public uniswapFactory;





    constructor(address _stablePay, address _factory)
        public ISwappingProvider(_stablePay)
    {
        uniswapFactory = _factory;

    }



    function swapToken(StablePayCommon.Order memory  _order)
    public isStablePay(msg.sender)
    returns (bool)
    {

        UniswapFactoryInterface uFactory = UniswapFactoryInterface(uniswapFactory);
        UniswapExchangeInterface sourceExchange = UniswapExchangeInterface(uFactory.getExchange(_order.sourceToken));
        UniswapExchangeInterface targetExchange = UniswapExchangeInterface(uFactory.getExchange(_order.targetToken));

        require(address(sourceExchange) != 0x0, "Exchange not found for source token");
        require(address(targetExchange) != 0x0, "Exchange not found for target token");


        require(_order.targetAmount > 0 , "Target amount cannot be zero");

        require(ERC20(_order.sourceToken).balanceOf(address(this)) >= _order.sourceAmount, "Not enough tokens in balance.");

        uint256 ethToBuyTargetToken = targetExchange.getEthToTokenOutputPrice(_order.targetAmount);
        uint256 sourceTokensToSell = sourceExchange.getTokenToEthOutputPrice(ethToBuyTargetToken);

        // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
        require(ERC20(_order.sourceToken).approve(address(sourceExchange), 0), "Error mitigating front-running attack.");
        // Set the spender's token allowance to tokenQty
        require(ERC20(_order.sourceToken).approve(address(sourceExchange), sourceTokensToSell), "Error approving tokens for exchange."); // Set max amount.


        uint256 tokens_sold = sourceExchange.tokenToTokenSwapOutput(
            _order.targetAmount ,
            sourceTokensToSell,

            ethToBuyTargetToken,
            (block.timestamp) + 300,
            _order.targetToken
        );

        require(ERC20(_order.targetToken).transfer(msg.sender,  _order.targetAmount), "Source transfer invocation was not successful.");

        return true;
    }
    function swapEther(StablePayCommon.Order memory  _order)
    public isStablePay(msg.sender)
    payable
    returns (bool)
    {


        UniswapFactoryInterface uFactory = UniswapFactoryInterface(uniswapFactory);

        require(uFactory.getExchange(_order.targetToken) != 0x0, "Exchange not found for target token");

        UniswapExchangeInterface targetExchange = UniswapExchangeInterface(uFactory.getExchange(_order.targetToken));
        uint256 ethToBuyTargetToken = targetExchange.getEthToTokenOutputPrice(_order.targetAmount);
        require(msg.value >= ethToBuyTargetToken, "Not enough value");

        uint eth_sold = targetExchange.ethToTokenSwapOutput.value(ethToBuyTargetToken)(
            _order.targetAmount,
            block.timestamp + 300
        );


        require(ERC20(_order.targetToken).transfer(msg.sender,  _order.targetAmount), "Source transfer invocation was not successful.");
        return true;

    }

    function getExpectedRate(ERC20 _sourceToken, ERC20 _targetToken, uint _sourceAmount)
    public
    view
    returns (bool, uint, uint)
    {
        UniswapFactoryInterface uFactory = UniswapFactoryInterface(uniswapFactory);
        UniswapExchangeInterface sourceExchange = UniswapExchangeInterface(uFactory.getExchange(_sourceToken));
        UniswapExchangeInterface targetExchange = UniswapExchangeInterface(uFactory.getExchange(_targetToken));

        uint256 ethToBuyTargetToken = targetExchange.getEthToTokenOutputPrice(_sourceAmount);
        uint256 sourceTokensTosell = sourceExchange.getTokenToEthOutputPrice(ethToBuyTargetToken);

        return (true, ethToBuyTargetToken, sourceTokensTosell);
    }

}