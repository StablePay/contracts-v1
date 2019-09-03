pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "./AbstractSwappingProvider.sol";
import "../services/uniswap/UniswapExchangeInterface.sol";
import "../services/uniswap/UniswapFactoryInterface.sol";

/**
    @title  Uniswap  Swapping provider.
    @author StablePay <hi@stablepay.io>
 */
contract UniswapSwappingProvider is AbstractSwappingProvider {
    address public uniswapFactory;
    address private ETH_ADDRESS = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

    constructor(address stablePayAddress, address uniswapFactoryAddress)
        public
        AbstractSwappingProvider(stablePayAddress)
    {
        uniswapFactory = uniswapFactoryAddress;
    }

    function swapToken(StablePayCommon.Order calldata _order)
        external
        isStablePay(msg.sender)
        returns (bool)
    {
        UniswapFactoryInterface uFactory = UniswapFactoryInterface(
            uniswapFactory
        );
        UniswapExchangeInterface sourceExchange = UniswapExchangeInterface(
            uFactory.getExchange(_order.sourceToken)
        );
        UniswapExchangeInterface targetExchange = UniswapExchangeInterface(
            uFactory.getExchange(_order.targetToken)
        );

        require(
            address(sourceExchange) != address(0x0),
            "Exchange not found for source token"
        );
        require(
            address(targetExchange) != address(0x0),
            "Exchange not found for target token"
        );

        require(_order.targetAmount > 0, "Target amount cannot be zero");

        // Check the current source token balance is higher (or equals) to the order source amount.
        uint256 sourceInitialTokenBalance = getTokenBalanceOf(
            _order.sourceToken
        );

        require(
            sourceInitialTokenBalance >= _order.sourceAmount,
            "Not enough tokens in balance."
        );

        uint256 ethToBuyTargetToken = targetExchange.getEthToTokenOutputPrice(
            _order.targetAmount
        );
        uint256 sourceTokensToSell = sourceExchange.getTokenToEthOutputPrice(
            ethToBuyTargetToken
        );

        require(
            _order.sourceAmount >= sourceTokensToSell,
            "Source amount not enough for the swapping."
        );

        // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
        require(
            IERC20(_order.sourceToken).approve(address(sourceExchange), 0),
            "Error mitigating front-running attack."
        );
        // Set the spender's token allowance to tokenQty
        require(
            IERC20(_order.sourceToken).approve(
                address(sourceExchange),
                sourceTokensToSell
            ),
            "Error approving tokens for exchange."
        ); // Set max amount.

        sourceExchange.tokenToTokenSwapOutput(
            _order.targetAmount,
            sourceTokensToSell,
            ethToBuyTargetToken,
            (block.timestamp) + 300,
            _order.targetToken
        );

        require(
            IERC20(_order.targetToken).transfer(msg.sender, _order.targetAmount),
            "Source transfer invocation was not successful."
        );

        // Get source token balance after swapping execution.
        uint256 sourceFinalTokenBalance = getTokenBalanceOf(_order.sourceToken);
        // Transfer diff (initial - final) source token balance to the sender.
        // The initial balance is higher (or equals) than final source token balance.
        transferDiffTokensIfApplicable(
            _order.sourceToken,
            msg.sender, // The address (StablePay) which will receive the source tokens left.
            _order.sourceAmount,
            sourceInitialTokenBalance,
            sourceFinalTokenBalance
        );

        return true;
    }

    function swapEther(StablePayCommon.Order calldata _order)
        external
        payable
        isStablePay(msg.sender)
        returns (bool)
    {
        UniswapFactoryInterface uFactory = UniswapFactoryInterface(
            uniswapFactory
        );

        require(
            uFactory.getExchange(_order.targetToken) != address(0x0),
            "Exchange not found for target token"
        );

        UniswapExchangeInterface targetExchange = UniswapExchangeInterface(
            uFactory.getExchange(_order.targetToken)
        );
        uint256 sourceInitialEtherBalance = getEtherBalance();

        uint256 ethToBuyTargetToken = targetExchange.getEthToTokenOutputPrice(
            _order.targetAmount
        );
        require(
            msg.value >= ethToBuyTargetToken,
            "Not enough value to complete swapping transaction"
        );

        targetExchange.ethToTokenSwapOutput.value(ethToBuyTargetToken)(
            _order.targetAmount,
            block.timestamp + 300
        );

        require(
            IERC20(_order.targetToken).transfer(msg.sender, _order.targetAmount),
            "Source transfer invocation was not successful."
        );

        // Get ether balance after swapping execution.
        uint256 sourceFinalEtherBalance = getEtherBalance();

        // Transfer back to the sender the diff balance (Ether).
        transferDiffEtherBalanceIfApplicable(
            _order.fromAddress,
            msg.value,
            sourceInitialEtherBalance,
            sourceFinalEtherBalance
        );

        return true;
    }

    function getExpectedRate(
        IERC20 _sourceToken,
        IERC20 _targetToken,
        uint256 _targetAmount
    ) external view returns (bool isSupported, uint256 minRate, uint256 maxRate) {
        require(address(_sourceToken) != address(0x0), "Source token != 0x0.");
        require(address(_targetToken) != address(0x0), "Target token != 0x0.");
        require(_targetAmount > 0, "Target amount > 0.");

        UniswapFactoryInterface uFactory = UniswapFactoryInterface(
            uniswapFactory
        );
        UniswapExchangeInterface targetExchange = UniswapExchangeInterface(
            uFactory.getExchange(address(_targetToken))
        );
        uint256 rate = 0;

        if (ETH_ADDRESS == address(_sourceToken)) {
            isSupported = address(targetExchange) != address(0x0);
            if (isSupported) {
                rate = targetExchange.getEthToTokenOutputPrice(_targetAmount);
            }
            return (isSupported, rate, rate);
        }

        UniswapExchangeInterface sourceExchange = UniswapExchangeInterface(
            uFactory.getExchange(address(_sourceToken))
        );

        if (
            address(sourceExchange) == address(0x0) ||
            _sourceToken.balanceOf(address(sourceExchange)) == 0
        ) {
            return (false, 0, 0);
        }

        if (ETH_ADDRESS == address(_targetToken)) {
            isSupported = address(sourceExchange) != address(0x0);
            if (isSupported) {
                rate = sourceExchange.getTokenToEthOutputPrice(_targetAmount);
            }
            return (isSupported, rate, rate);
        }

        if (
            address(targetExchange) == address(0x0) ||
            _targetToken.balanceOf(address(targetExchange)) == 0
        ) {
            return (false, 0, 0);
        }

        isSupported =
            address(sourceExchange) != address(0x0) &&
            address(targetExchange) != address(0x0);
        if (isSupported) {
            uint256 ethToBuyTargetToken = targetExchange
                .getEthToTokenOutputPrice(_targetAmount);
            rate = sourceExchange.getTokenToEthOutputPrice(ethToBuyTargetToken);
        }

        return (isSupported, rate, rate);
    }
}
