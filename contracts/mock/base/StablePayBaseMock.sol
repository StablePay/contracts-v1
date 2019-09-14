pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../../base/StablePayBase.sol";

contract StablePayBaseMock is StablePayBase {
    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address _storageAddress)
        public
        StablePayBase(_storageAddress)
    {}

    /** Methods */

    function _getFeeAmount(StablePayCommon.Order memory order)
        public
        view
        returns (uint256)
    {
        return super.getFeeAmount(order);
    }

    function _transferTokensIfTokensAreEquals(
        StablePayCommon.Order memory order
    ) public returns (bool) {
        return super.transferTokensIfTokensAreEquals(order);
    }

    function _allowanceHigherOrEquals(
        address token,
        address owner,
        address spender,
        uint256 amount
    ) public view returns (bool) {
        super.allowanceHigherOrEquals(token, owner, spender, amount);
        return true;
    }

    function _transferFrom(
        address token,
        address from,
        address to,
        uint256 amount
    ) public returns (bool) {
        super.transferFrom(token, from, to, amount);
        return true;
    }

    function _transferDiffEtherBalanceIfApplicable(
        address payable to,
        uint256 sentAmount,
        uint256 initialBalance,
        uint256 finalBalance
    ) public returns (bool, uint256) {
        return
            super.transferDiffEtherBalanceIfApplicable(
                to,
                sentAmount,
                initialBalance,
                finalBalance
            );
    }

    function _checkCurrentTargetBalance(
        uint256 targetAmount,
        uint256 initialBalance,
        uint256 finalBalance
    ) public pure returns (bool) {
        super.checkCurrentTargetBalance(
            targetAmount,
            initialBalance,
            finalBalance
        );
        return true;
    }

    function _calculateAndTransferFee(StablePayCommon.Order memory order)
        public
        returns (bool success, uint256 feeAmount)
    {
        return super.calculateAndTransferFee(order);
    }

    function _calculateAndTransferAmountToPostActionAddress(
        StablePayCommon.Order memory order,
        uint256 feeAmount
    ) public returns (uint256 toAmount) {
        return super.calculateAndTransferAmountToPostActionAddress(order, feeAmount);
    }
}
