pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../erc20/ERC20.sol";
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

    /**** Events ***********/

    event PaymentSent(
        address indexed thisContract,
        address merchant,
        address customer,
        address sourceToken,
        address targetToken,
        uint amount
    );

    /*** Modifiers ***************/

    /*** Constructor ***************/

    constructor(address _proxy) public {
        proxy = _proxy;
    }

    /*** Fallback Method ***************/

    function () external payable {}

    /*** Methods ***************/

    event Check (
        address proxy,
        address sourceToken,
        address targetToken,
        uint256 amount
    );

    function testGetExpectedRate(uint _amount, address _sourceToken, address _targetToken)
    public
    view
    returns (uint, uint)
    {
        ERC20 sourceToken = ERC20(_sourceToken);
        ERC20 targetToken = ERC20(_targetToken);
        return KyberNetworkProxy(proxy).getExpectedRate(sourceToken, targetToken, _amount);
    }

    event CheckGetRateExpected(
        address src, address dest, uint srcQty
    );

    function getExpectedRate(ERC20 _sourceToken, ERC20 _targetToken, uint _amount)
    public
    view
    returns (uint)
    {
        require(_amount > 1000, "Amount > 1000.");
        require(address(_sourceToken) != address(0x0), "sourceToken != 0x0.");
        require(address(_targetToken) != address(0x0), "targetoken != 0x0.");
        uint minConversionRate;
        uint slippageRate;

        KyberNetworkProxy networkProxy = KyberNetworkProxy(proxy);
        (minConversionRate,slippageRate) = networkProxy.getExpectedRate(_sourceToken, _targetToken, _amount);
        return minConversionRate;

    }

    // TODO Add restriction for StablePay contract.
    function swapToken(StablePayCommon.Order _order)
    public
    returns (bool)
    {
        
        require(_order.amount > 0, "Amount must be > 0");
        require(_order.merchantAddress != address(0x0), "Merchant must be != 0x0.");
        address _seller = _order.merchantAddress;
        uint256 _amount = _order.amount;

        ERC20 sourceToken = ERC20(_order.sourceToken);
        ERC20 targetToken = ERC20(_order.targetToken);

        uint256 thisSourceTokenBalance = sourceToken.balanceOf(address(this));
        require(thisSourceTokenBalance >= _amount, "Not enough tokens in balance.");

        // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
        require(sourceToken.approve(address(proxy), 0), "Error mitigating front-running attack.");
        // Set the spender's token allowance to tokenQty
        require(sourceToken.approve(address(proxy), _amount), "Error approving tokens for proxy."); // Set max amount.

        // Get the minimum conversion rate
        uint minConversionRate = getExpectedRate(sourceToken, targetToken, _amount);

        // Swap the ERC20 token to ETH
        uint destAmount = KyberNetworkProxy(proxy).swapTokenToToken(sourceToken, _amount, targetToken, minConversionRate);

        // Send the swapped tokens to the destination address
        bool transferResult = targetToken.transfer(_seller, destAmount);
        require(transferResult, "Transfer invocation was not successful.");

        emit PaymentSent(
            address(this),
            _seller,
            msg.sender,
            address(sourceToken),
            address(targetToken),
            destAmount
        );
        
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