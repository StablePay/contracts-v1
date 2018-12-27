pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;


import "../ZeroxSwappingProvider.sol";

/**
    @dev Mock for Stable Pay smart contract.
 */
contract StablePayMock is ZeroxSwappingProvider {

    /**** Events ***********/

    /*** Modifiers ***************/

    /*** Constructor ***************/

    constructor(address _assetProxy, address _exchange, address _wethErc20)
    public ZeroxSwappingProvider(_assetProxy, _exchange, _wethErc20) {
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
        return super.checkAllowance(_erc20, _payer, _amount);
    }

    function _transferFromPayer(
        address _erc20,
        address _payer,
        uint256 _amount
    )

    public
    returns (bool) {

        return super.transferFromPayer(_erc20, _payer, _amount);
    }

}