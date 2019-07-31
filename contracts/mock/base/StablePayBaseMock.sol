pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../../base/StablePayBase.sol";

contract StablePayBaseMock is StablePayBase {

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address _storageAddress)
        public StablePayBase(_storageAddress) {}

    /** Methods */

    function _getFeeAmount(StablePayCommon.Order memory order)
    public
    view
    returns (uint256) {
        return super.getFeeAmount(order);
    }

    function _transferTokensIfTokensAreEquals(StablePayCommon.Order memory order)
    public
    returns (bool){
        return super.transferTokensIfTokensAreEquals(order);
    }

    function _allowanceHigherOrEquals(address token, address owner, address spender, uint amount)
    public
    view
    returns (bool)
    {
        return super.allowanceHigherOrEquals(token, owner, spender, amount);
    }

    function _transferFrom(address token, address from, address to, uint256 amount)
    public
    returns (bool)
    {
        return super.transferFrom(token, from, to, amount);
    }

    function _transferDiffEtherBalanceIfApplicable(address payable to, uint sentAmount, uint initialBalance, uint finalBalance)
    public
    returns (bool, uint)
    {
        return super.transferDiffEtherBalanceIfApplicable(to, sentAmount, initialBalance, finalBalance);
    }

    function _checkCurrentTargetBalance(uint targetAmount, uint initialBalance, uint finalBalance)
    public
    pure
    returns (bool)
    {
        return super.checkCurrentTargetBalance(targetAmount, initialBalance, finalBalance);
    }


    function _calculateAndTransferFee(StablePayCommon.Order memory order)
    public
    returns (bool success, uint feeAmount)
    {
        return super.calculateAndTransferFee(order);
    }

    function _calculateAndTransferToAmount(StablePayCommon.Order memory order, uint feeAmount)
    public
    returns (bool success, uint toAmount)
    {
        return super.calculateAndTransferToAmount(order, feeAmount);
    }
}