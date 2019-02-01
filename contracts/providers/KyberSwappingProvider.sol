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
    returns (uint, uint)
    {
        require(address(_sourceToken) != address(0x0), "sourceToken != 0x0.");
        require(address(_targetToken) != address(0x0), "targetoken != 0x0.");
        KyberNetworkProxyInterface networkProxy = KyberNetworkProxyInterface(proxy);
        return networkProxy.getExpectedRate(_sourceToken, _targetToken, _sourceAmount);
    }

    event Remain(
        uint256 _value1,
        uint256 _value2,
        uint256 _value3,
        uint256 _value4
    );

    function swapToken(StablePayCommon.Order _order)
    public
    isStablePay(msg.sender)
    returns (bool)
    {
        
        require(_order.sourceAmount > 0, "Amount must be > 0");
        require(_order.merchantAddress != address(0x0), "Merchant must be != 0x0.");
        //uint256 _sourceAmount = _order.sourceAmount;
        //uint256 _targetAmount = _order.targetAmount;

        //ERC20 sourceToken = ERC20(_order.sourceToken);
        //ERC20 targetToken = ERC20(_order.targetToken);

        uint256 thisSourceInitialTokenBalance = ERC20(_order.sourceToken).balanceOf(address(this));
        require(thisSourceInitialTokenBalance >= _order.sourceAmount, "Not enough tokens in balance.");

        // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
        require(ERC20(_order.sourceToken).approve(address(proxy), 0), "Error mitigating front-running attack.");
        // Set the spender's token allowance to tokenQty
        require(ERC20(_order.sourceToken).approve(address(proxy), _order.sourceAmount), "Error approving tokens for proxy."); // Set max amount.

        // Get the minimum conversion rate
        uint minConversionRate;
        uint maxRate;
        (minConversionRate, maxRate) = getExpectedRate(ERC20(_order.sourceToken), ERC20(_order.targetToken), _order.sourceAmount);

        // Swap the ERC20 token to ETH
        uint remainSourceTokens = KyberNetworkProxy(proxy).trade(
            ERC20(_order.sourceToken),
            _order.sourceAmount,
            ERC20(_order.targetToken),
            msg.sender,
            _order.targetAmount,
            minConversionRate,
            0
        );

        uint256 thisSourceFinalTokenBalance = ERC20(_order.sourceToken).balanceOf(address(this));
        
        /*
        uint256 value = thisSourceInitialTokenBalance.sub(thisSourceFinalTokenBalance);
        emit Remain(
            thisSourceInitialTokenBalance,
            thisSourceFinalTokenBalance,
            remainSourceTokens,
            value
        );
        */

        bool sourceTransferResult = ERC20(_order.sourceToken).transfer(msg.sender, thisSourceFinalTokenBalance);
        require(sourceTransferResult, "Source transfer invocation was not successful.");

        return true;
    }

    function swapEther(StablePayCommon.Order _order)
    public
    payable
    returns (bool)
    {
        return false;
    }
}