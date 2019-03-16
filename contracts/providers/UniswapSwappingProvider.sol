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



    event PaymentSent(
        address indexed thisContract,
        address merchant,
        address customer,
        address sourceToken,
        address targetToken,
        uint256 amount,
        uint256 provider
    );

    constructor(address _stablePay, address _exchange)
        public ISwappingProvider(_stablePay){
        uniswapFactory = _exchange;
    }

    function tokenToEth(address exchange, address token, uint256 amount)
    internal
    returns (uint256)
    {
        // TokenA (ERC20) to ETH conversion
        uint inputAmountA = amount;
        uint inputReserveA = ERC20(token).balanceOf(exchange);
        uint outputReserveA = exchange.balance;

        uint numeratorA = inputAmountA * outputReserveA * 997;
        uint denominatorA = inputReserveA * 1000 + inputAmountA * 997;
        uint outputAmountA = numeratorA / denominatorA;
        return outputAmountA;
    }
    function ethToToken(address exchange, address token, uint256 amount)
    internal
    returns (uint256)
    {
       // ETH to TokenB conversion 
        uint inputAmountB = amount;    
        uint inputReserveB = exchange.balance;
        uint outputReserveB = ERC20(token).balanceOf(exchange);

        uint numeratorB = inputAmountB * outputReserveB * 997;
        uint denominatorB = inputReserveB * 1000 + inputAmountB * 997;
        uint outputAmountB = numeratorB / denominatorB;  
        return outputAmountB;
    }

    function buyTokenWithETH(address exchange, address token, uint256 userInputEthValue)
    internal
    returns (uint256)
    {
       // Buy ERC20 with ETH
        uint outputAmount = userInputEthValue;
        uint inputReserve = exchange.balance;
        uint outputReserve = ERC20(token).balanceOf(exchange);


        // Cost
        uint numerator = outputAmount * inputReserve * 1000;
        uint denominator = (outputReserve - outputAmount) * 997;
        uint inputAmount = numerator / denominator + 1;

        return inputAmount;
    }

    function swapToken(StablePayCommon.Order _order)
        public isStablePay(msg.sender)
        returns (bool)
    {
       
        UniswapFactoryInterface uFactory = UniswapFactoryInterface(uniswapFactory);
 

        require(uFactory.getExchange(_order.sourceToken) != 0x0, "Exchange not found for source token");
        require(uFactory.getExchange(_order.targetToken) != 0x0, "Exchange not found for target token");
        require(ERC20(_order.sourceToken).allowance(msg.sender, address(this)) >= _order.sourceAmount, "Not enough allowed tokens.");

        // move tokens to provider address
        require(ERC20(_order.sourceToken).transferFrom(msg.sender, address(this), _order.sourceAmount), "TransferFrom invocation was not successful.");
        
        UniswapExchangeInterface uExchange = UniswapExchangeInterface(uFactory.getExchange(_order.sourceToken));

        // TokenA (ERC20) to ETH conversion
        uint256 outputAmountA = tokenToEth(uFactory.getExchange(_order.sourceToken), ERC20(_order.sourceToken), _order.sourceAmount);

        // ETH to TokenB conversion 
        uint256 outputAmountB = ethToToken(uFactory.getExchange(_order.targetToken), ERC20(_order.targetToken), outputAmountA);

        //TODO review swap with transfer
        uint tokens_bought = uExchange.tokenToTokenSwapInput(
            _order.sourceAmount,
            outputAmountB,
            outputAmountA,
            (block.number * 900) + 300,
            _order.targetToken
        );
        
        // Send the swapped tokens to the destination address
        bool transferResult = ERC20(_order.targetToken).transfer(msg.sender, tokens_bought);
        require(transferResult, "Transfer invocation was not successful.");

        return true;
    }
    function swapEther(StablePayCommon.Order _order)
        public isStablePay(msg.sender)
        payable
        returns (bool)
    {


        UniswapFactoryInterface uFactory = UniswapFactoryInterface(uniswapFactory);
 
        require(uFactory.getExchange(_order.targetToken) != 0x0, "Exchange not found for target token");

        UniswapExchangeInterface uExchange = UniswapExchangeInterface(uFactory.getExchange(_order.sourceToken));

        uint256 amountTokens = buyTokenWithETH(uFactory.getExchange(_order.targetToken), ERC20(_order.targetToken), msg.value);

        
        uint tokens_bought = uExchange.ethToTokenSwapInput(
            amountTokens,        
            (block.number * 900) + 300
        );
        
        // Send the swapped tokens to the destination address
        bool transferResult = ERC20(_order.targetToken).transfer(msg.sender, tokens_bought);
        require(transferResult, "Transfer invocation was not successful.");

        return true;
        
    }

    function getExpectedRate(ERC20 _sourceToken, ERC20 _targetToken, uint _sourceAmount)
    public
    view
    returns (bool, uint, uint)
    {
        UniswapFactoryInterface uFactory = UniswapFactoryInterface(uniswapFactory);
         // TokenA (ERC20) to ETH conversion
        uint256 outputAmountA = tokenToEth(uFactory.getExchange(_sourceToken), ERC20(_sourceToken), _sourceAmount);

        // ETH to TokenB conversion 
        uint256 outputAmountB = ethToToken(uFactory.getExchange(_targetToken), ERC20(_targetToken), outputAmountA);

        return (true, outputAmountB, outputAmountA);
    }

}