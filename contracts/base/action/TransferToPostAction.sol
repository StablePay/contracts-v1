pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "./PostActionBase.sol";

contract TransferToPostAction is PostActionBase {
    /** Constants */

    address internal constant ADDRESS_EMPTY = address(0x0);
    bytes32 internal constant DEFAULT_ACTION_DATA = "DefaultAction";

    /** Properties */

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address storageAddress) public PostActionBase(storageAddress) {}

    /** Fallback Method */

    /** Functions */

    function execute(StablePayCommon.PostActionData memory postActionData)
        public
        isStablePay(msg.sender)
        returns (bool)
    {
        require(
            ERC20(postActionData.targetToken).balanceOf(address(this)) >=
                postActionData.toAmount,
            "Balance of ERC20 is not >= amount to transfer."
        );

        // Transfer the 'to' amount to the 'to' address.
        bool result = IERC20(postActionData.targetToken).transfer(
            postActionData.toAddress,
            postActionData.toAmount
        );
        require(result, "Transfer to 'to' address failed.");

        emit ActionExecuted(
            address(this),
            postActionData.sourceAmount,
            postActionData.toAmount,
            postActionData.feeAmount,
            0,
            postActionData.sourceToken,
            postActionData.targetToken,
            postActionData.toAddress,
            ADDRESS_EMPTY,
            postActionData.fromAddress,
            DEFAULT_ACTION_DATA,
            postActionData.data
        );

        return true;
    }
}
