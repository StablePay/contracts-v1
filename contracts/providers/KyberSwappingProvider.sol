pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../erc20/ERC20.sol";
import "../kyber/SimpleNetworkInterface.sol";
import "../kyber/KyberNetworkProxyInterface.sol";
import "../kyber/KyberNetworkProxy.sol";
import "../util/StablePayCommon.sol";
import "./ISwappingProvider.sol";
import "../util/SafeMath.sol";

/**


https://developer.kyber.network/docs/VendorsGuide/#converting-from-erc20
https://developer.kyber.network/docs/KyberNetworkProxy/#getexpectedrate
 */
contract KyberSwappingProvider is ISwappingProvider {
    using SafeMath for uint256;

    ERC20 constant internal ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);
    address public proxy;

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address _stablePay, address _proxy)
        public ISwappingProvider(_stablePay) {
        proxy = _proxy;
    }

    /*** Fallback Method ***************/

    function () external payable {}

    /*** Methods ***************/

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
        require(_order.sourceAmount > 0, "Amount must be > 0");
        require(_order.merchantAddress != address(0x0), "Merchant must be != 0x0.");

        // Get the minimum conversion rate
        bool isSupported;
        uint minRate;
        uint maxRate;
        (isSupported, minRate, maxRate) = getExpectedRate(ERC20(_order.sourceToken), ERC20(_order.targetToken), _order.sourceAmount);

        require(isSupported, "Swap not supported. Verify source/target amount.");

        uint256 thisSourceInitialTokenBalance = ERC20(_order.sourceToken).balanceOf(address(this));
        require(thisSourceInitialTokenBalance >= _order.sourceAmount, "Not enough tokens in balance.");

        // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
        require(ERC20(_order.sourceToken).approve(address(proxy), 0), "Error mitigating front-running attack.");
        // Set the spender's token allowance to tokenQty
        require(ERC20(_order.sourceToken).approve(address(proxy), _order.sourceAmount), "Error approving tokens for proxy."); // Set max amount.

        emit Remain(_order.minRate, minRate, maxRate, _order.maxRate);

        // Swap the ERC20 token to ETH
        uint remainSourceTokens = KyberNetworkProxy(proxy).trade(
            ERC20(_order.sourceToken),
            _order.sourceAmount,
            ERC20(_order.targetToken),
            msg.sender,
            _order.targetAmount,
            maxRate,
            0
        );

        uint256 thisSourceFinalTokenBalance = ERC20(_order.sourceToken).balanceOf(address(this));

        bool sourceTransferResult = ERC20(_order.sourceToken).transfer(msg.sender, thisSourceFinalTokenBalance);
        require(sourceTransferResult, "Source transfer invocation was not successful.");

        return true;
    }

    event Remain(
        uint256 _value1,
        uint256 _value2,
        uint256 _value3,
        uint256 _value4
    );

    function swapEther(StablePayCommon.Order _order)
    public
    payable
    returns (bool)
    {
        require(msg.value > 0, "Msg value must be > 0");
        require(_order.sourceAmount > 0, "Amount must be > 0");
        require(msg.value == _order.sourceAmount, "Msg value == source amount");
        require(_order.merchantAddress != address(0x0), "Merchant must be != 0x0.");

        // Get the minimum conversion rate
        bool isSupported;
        uint minRate;
        uint maxRate;
        (isSupported, minRate, maxRate) = getExpectedRate(ERC20(_order.sourceToken), ERC20(_order.targetToken), _order.sourceAmount);

        require(isSupported, "Swap not supported. Verify source/target amount.");

        uint256 thisSourceInitialTokenBalance = address(this).balance;
        require(thisSourceInitialTokenBalance >= _order.sourceAmount, "Not enough ether in balance.");

        emit Remain(_order.minRate, minRate, maxRate, _order.maxRate);

        // Swap the ERC20 token to ETH        
        uint remainSourceTokens = KyberNetworkProxy(proxy).trade.value(msg.value)(
            ERC20(_order.sourceToken),
            _order.sourceAmount,
            ERC20(_order.targetToken),
            msg.sender,
            _order.targetAmount,
            maxRate,
            0
        );

        uint256 thisSourceFinalTokenBalance = address(this).balance;
        msg.sender.transfer(thisSourceFinalTokenBalance);
        return true;
    }
}