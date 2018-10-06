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

}