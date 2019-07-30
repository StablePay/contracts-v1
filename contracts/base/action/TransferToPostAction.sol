pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "./PostActionBase.sol";

contract TransferToPostAction is PostActionBase {

    /** Constants */

    address constant internal ADDRESS_EMPTY = address(0x0);
    bytes32 constant internal DEFAULT_ACTION_DATA = "DefaultAction";

    /** Properties */

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address storageAddress)
        public PostActionBase(storageAddress) {
    }

    /** Fallback Method */

    /** Functions */

    function execute(StablePayCommon.PostActionData memory postActionData)
    public
    isStablePay(msg.sender)
    returns (bool){
        // Calculate the 'to' amount.
        uint256 currentToAmount = postActionData.targetAmount.sub(postActionData.feeAmount);

        require(ERC20(postActionData.targetToken).balanceOf(address(this)) >= currentToAmount, "Balance of ERC20 is not >= amount to transfer.");
        
        // Transfer the 'to' amount to the 'to' address.
        bool result = ERC20(postActionData.targetToken).transfer(postActionData.toAddress, currentToAmount);
        require(result, "Transfer to 'to' address failed.");

        emit ActionExecuted(
            address(this),
            postActionData.sourceAmount,
            postActionData.targetAmount,
            postActionData.feeAmount,
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
