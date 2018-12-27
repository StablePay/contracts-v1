pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "./erc20/ERC20.sol";
import "./kyber/KyberNetworkProxy.sol";
import "./StablePayCommon.sol";
import "./ISwappingProvider.sol";


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

    // TODO Should it allow be invoked by other contracts or only StablePay?
    function payToken(StablePayCommon.Order _order)
    public
    returns (bool)
    {
        address _seller = _order.merchantAddress;
        uint256 _amount = _order.amount;

        ERC20 sourceToken = ERC20(_order.sourceToken);
        ERC20 targetToken = ERC20(_order.targetToken);

        uint256 thisSourceTokenBalance = sourceToken.allowance(msg.sender, address(this));
        require(thisSourceTokenBalance >= _amount, "Not enough allowed tokens.");

        // Check that the token transferFrom has succeeded
        bool transferFromResult = sourceToken.transferFrom(msg.sender, address(this), _amount);
        require(transferFromResult, "TransferFrom invocation was not successful.");
        
        // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
        require(sourceToken.approve(address(proxy), 0), "Error mitigating front-running attack.");

        // Set the spender's token allowance to tokenQty
        require(sourceToken.approve(address(proxy), _amount), "Error approving tokens for proxy."); // Set max amount.
        
        // Get the minimum conversion rate
        uint minConversionRate;
        (minConversionRate,) = KyberNetworkProxy(proxy).getExpectedRate(sourceToken, targetToken, _amount);

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

    function payEther(StablePayCommon.Order _order)
    public
    payable
    returns (bool)
    {
        return false;
    }
}