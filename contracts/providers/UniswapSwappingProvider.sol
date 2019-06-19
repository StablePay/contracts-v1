pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "./ISwappingProvider.sol";
import "../erc20/ERC20.sol";
import "../uniswap/UniswapExchangeInterface.sol";
import "../uniswap/UniswapFactoryInterface.sol";
import "../util/StablePayCommon.sol";
import "../util/SafeMath.sol";

/**
    @dev Stable Pay Uniswap provider.
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

        // Check the current source token balance is higher (or equals) to the order source amount.
        uint256 sourceInitialTokenBalance = getTokenBalanceOf(_order.sourceToken);

        require( sourceInitialTokenBalance>= _order.sourceAmount, "Not enough tokens in balance.");

        uint256 ethToBuyTargetToken = targetExchange.getEthToTokenOutputPrice(_order.targetAmount);
        uint256 sourceTokensToSell = sourceExchange.getTokenToEthOutputPrice(ethToBuyTargetToken);

        require(_order.sourceAmount  >= sourceTokensToSell , "Source amount not enough for the swapping.");

        // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
        require(ERC20(_order.sourceToken).approve(address(sourceExchange), 0), "Error mitigating front-running attack.");
        // Set the spender's token allowance to tokenQty
        require(ERC20(_order.sourceToken).approve(address(sourceExchange), sourceTokensToSell), "Error approving tokens for exchange."); // Set max amount.


        sourceExchange.tokenToTokenSwapOutput(
            _order.targetAmount ,
            sourceTokensToSell,

            ethToBuyTargetToken,
            (block.timestamp) + 300,
            _order.targetToken
        );

        require(ERC20(_order.targetToken).transfer(msg.sender,  _order.targetAmount), "Source transfer invocation was not successful.");

        // Get source token balance after swapping execution.
        uint256 sourceFinalTokenBalance = getTokenBalanceOf(_order.sourceToken);
        // Transfer diff (initial - final) source token balance to the sender.
        // The initial balance is higher (or equals) than final source token balance.
        transferDiffTokensIfApplicable(_order.sourceToken, _order.fromAddress, _order.sourceAmount, sourceInitialTokenBalance, sourceFinalTokenBalance);


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
        uint256 sourceInitialEtherBalance = getEtherBalance();


        uint256 ethToBuyTargetToken = targetExchange.getEthToTokenOutputPrice(_order.targetAmount);
        require(msg.value >= ethToBuyTargetToken, "Not enough value to complete swapping transaction");

        targetExchange.ethToTokenSwapOutput.value(ethToBuyTargetToken)(
            _order.targetAmount,
            block.timestamp + 300
        );



        require(ERC20(_order.targetToken).transfer(msg.sender,  _order.targetAmount), "Source transfer invocation was not successful.");

        // Get ether balance after swapping execution.
        uint256 sourceFinalEtherBalance = getEtherBalance();

        // Transfer back to the sender the diff balance (Ether).
        transferDiffEtherBalanceIfApplicable(_order.fromAddress, msg.value, sourceInitialEtherBalance, sourceFinalEtherBalance);

    return true;
    }

    function getExpectedRate(ERC20 _sourceToken, ERC20 _targetToken, uint _sourceAmount)
    public
    view
    returns (bool isSupported, uint minRate, uint maxRate)
    {
        require(address(_sourceToken) != address(0x0), "Source token != 0x0.");
        require(address(_targetToken) != address(0x0), "Target token != 0x0.");
        require(_sourceAmount > 0, "Source amount > 0.");
        
        UniswapFactoryInterface uFactory = UniswapFactoryInterface(uniswapFactory);
        UniswapExchangeInterface sourceExchange = UniswapExchangeInterface(uFactory.getExchange(_sourceToken));
        UniswapExchangeInterface targetExchange = UniswapExchangeInterface(uFactory.getExchange(_targetToken));

        isSupported = sourceExchange != address(0x0) && targetExchange != address(0x0);
        uint rate = _sourceAmount;
        if(isSupported) {
            uint256 ethToBuyTargetToken = targetExchange.getEthToTokenOutputPrice(_sourceAmount);
            rate = sourceExchange.getTokenToEthOutputPrice(ethToBuyTargetToken);
        }

        return (isSupported, rate, rate);
    }
}
