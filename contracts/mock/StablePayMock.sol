pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../base/StablePayBase.sol";

contract StablePayMock is StablePayBase {

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address _storageAddress)
        public StablePayBase(_storageAddress) {
        version = 1;
    }

    /** Methods */

    function _getFeeAmount(StablePayCommon.Order order)
    public
    view
    returns (uint256) {
        return super.getFeeAmount(order);
    }

    function _isTransferTokens(StablePayCommon.Order order)
    public
    returns (bool){
        return super.isTransferTokens(order);
    }
}