pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;


import "../StablePay.sol";

/**
    @dev Mock for Stable Pay smart contract.
 */
contract StablePayMock is StablePay {

    /**** Events ***********/

    /*** Modifiers ***************/

    /*** Constructor ***************/

    constructor(address _assetProxy, address _exchange, address _wethErc20)
    public StablePay(_assetProxy, _exchange, _wethErc20) {
    }

    /*** Methods ***************/

    function _checkAllowance(
        address _erc20,
        address _payer,
        uint256 _amount
    )
    public
    view
    returns (bool)
    {
        return true;
    }
}