pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../../../base/action/PostActionBase.sol";

/**
    @title Mock contract to test PostActionBase functions and modifiers.
    @author StablePay <hi@stablepay.io>
 */
contract PostActionBaseMock is PostActionBase {
    /** Constructor */

    /**
        @notice It creates a new PostActionBaseMock instance associated to an Eternal Storage implementation.
        @param storageAddress the Eternal Storage implementation.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress) public PostActionBase(storageAddress) {}

    /** Functions */

    /**
        @notice Mock function to test the modifier isStablePay.
        @param anAddress address to check.
     */
    function _isStablePay(address anAddress) public view isStablePay(anAddress) {}

    function _getStablePayAddress() public view returns (address) {
        return getStablePayAddress();
    }

    function execute(StablePayCommon.PostActionData memory postActionData) public {
        postActionData;
    }
}
