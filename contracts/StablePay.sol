pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;


import "./erc20/ERC20.sol";
import "./0x/interfaces/IExchange.sol";
import "./0x/interfaces/IAssetProxy.sol";
import "./0x/libs/LibOrder.sol";
import "./0x/libs/LibFillResults.sol";

/**
    @dev Stable Pay smart contract.
 */
contract StablePay {

    address public assetProxy;
    address public exchange;
    address public wethErc20;

    /**** Events ***********/

    /*** Modifiers ***************/

    /*** Constructor ***************/

    constructor(address _assetProxy, address _exchange, address _wethErc20) public {
        assetProxy = _assetProxy;
        exchange = _exchange;
        wethErc20 = _wethErc20;
    }

    /*** Fallback Method ***************/

    function () public payable {}

    /*** Methods ***************/

    function checkAllowance(
        address _erc20,
        address _payer,
        uint256 _amount
    )
    internal
    view
    returns (bool)
    {
        ERC20 token = ERC20(_erc20);
        uint256 thisErc20Balance = token.allowance(_payer, address(this));
        require(thisErc20Balance >= _amount, "Not enough allowed tokens.");
        return true;
    }

    /**
       @dev It transfers tokens from the seller to this contract.
       @dev it  assumes allowance has been done.
    */
    function transferFromPayer(
        address _erc20,
        address _payer,
        uint256 _amount
    )

    internal
    returns (bool) {
        ERC20 token = ERC20(_erc20);
        bool transferResult = token.transferFrom(
            _payer,
            address(this),
            _amount
        );
        require(transferResult, "Transfer from ERC20 failed.");
        return true;
    }






}