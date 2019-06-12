pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../erc20/ERC20.sol";
import "../kyber/SimpleNetworkInterface.sol";
import "../kyber/KyberNetworkProxyInterface.sol";
import "../kyber/KyberNetworkProxy.sol";
import "../util/StablePayCommon.sol";
import "./ISwappingProvider.sol";

/**
    https://developer.kyber.network/docs/VendorsGuide/#converting-from-erc20
    https://developer.kyber.network/docs/KyberNetworkProxy/#getexpectedrate
 */
contract KyberSwappingProvider is ISwappingProvider {

    ERC20 constant internal ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);
    address public proxy;

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address _stablePay, address _proxy)
        public ISwappingProvider(_stablePay) {
        proxy = _proxy;
    }

    /** Methods */

    function getExpectedRate(ERC20 _sourceToken, ERC20 _targetToken, uint _sourceAmount)
    public
    view
    returns (bool isSupported, uint minRate, uint maxRate)
    {
        require(address(_sourceToken) != address(0x0), "Source token != 0x0.");
        require(address(_targetToken) != address(0x0), "Targe token != 0x0.");
        KyberNetworkProxyInterface networkProxy = KyberNetworkProxyInterface(proxy);
        (minRate, maxRate) = networkProxy.getExpectedRate(_sourceToken, _targetToken, _sourceAmount);
        isSupported = minRate > 0 || maxRate > 0;
        return (isSupported, minRate, maxRate);
    }

    function swapToken(StablePayCommon.Order _order)
    public
    isStablePay(msg.sender)
    returns (bool)
    {
        require(_order.sourceAmount > 0, "Source amount must be > 0");
        require(_order.toAddress != address(0x0), "To address must be != 0x0.");

        // Gets the ERC20 source/target token instances.
        ERC20 sourceToken = ERC20(_order.sourceToken);
        ERC20 targetToken = ERC20(_order.targetToken);

        // Get expected rates if the swapping is supported.
        uint minRate;
        uint maxRate;
        (minRate, maxRate) = getExpectedRateIfSupported(sourceToken, targetToken, _order.sourceAmount);

        // Check the current source token balance is higher (or equals) to the order source amount.
        uint256 sourceInitialTokenBalance = getTokenBalanceOf(_order.sourceToken);
        require(sourceInitialTokenBalance >= _order.sourceAmount, "Not enough tokens in balance.");

        // Set the spender's token allowance to tokenQty
        approveTokensTo(sourceToken, address(proxy), _order.sourceAmount);

        // Execute swap between the ERC20 token to ERC20 token.
        KyberNetworkProxy(proxy).trade(
            sourceToken,
            _order.sourceAmount,
            targetToken,
            msg.sender, // Kyber will call sender fallback function to transfer back the ether left.
            _order.targetAmount,
            maxRate,
            0
        );

        // Get source token balance after swapping execution.
        uint256 sourceFinalTokenBalance = getTokenBalanceOf(_order.sourceToken);

        // Transfer diff (initial - final) source token balance to the sender.
        // The initial balance is higher (or equals) than final source token balance.
        transferDiffTokensIfApplicable(_order.sourceToken, msg.sender, _order.sourceAmount, sourceInitialTokenBalance, sourceFinalTokenBalance);

        return true;
    }

    function swapEther(StablePayCommon.Order _order)
    public
    payable
    isStablePay(msg.sender)
    returns (bool)
    {
        require(msg.value > 0, "Msg value must be > 0");
        require(_order.sourceAmount > 0, "Amount must be > 0");
        require(msg.value == _order.sourceAmount, "Msg value == source amount");
        require(_order.toAddress != address(0x0), "To address must be != 0x0.");

        // Gets the ERC20 source/target token instances.
        ERC20 sourceToken = ERC20(_order.sourceToken);
        ERC20 targetToken = ERC20(_order.targetToken);

        // Get expected rates if the swapping is supported.
        uint minRate;
        uint maxRate;
        (minRate, maxRate) = getExpectedRateIfSupported(sourceToken, targetToken, _order.sourceAmount);

        // Get ether balance before swapping execution, and validate it is higher (or equals) to order source amount.
        uint256 sourceInitialEtherBalance = getEtherBalance();
        require(sourceInitialEtherBalance >= _order.sourceAmount, "Not enough ether in balance.");

        // Execute the swapping from ERC20 token to ETH.
        KyberNetworkProxy(proxy).trade.value(msg.value)(
            sourceToken,
            _order.sourceAmount,
            targetToken,
            msg.sender,
            _order.targetAmount,
            maxRate,
            0
        );

        // Get ether balance after swapping execution.
        uint256 sourceFinalEtherBalance = getEtherBalance();

        // Transfer back to the sender the diff balance (Ether).
        transferDiffEtherBalanceIfApplicable(_order.fromAddress, msg.value, sourceInitialEtherBalance, sourceFinalEtherBalance);

        return true;
    }
}