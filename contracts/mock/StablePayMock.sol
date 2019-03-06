pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../StablePay.sol";

contract StablePayMock is StablePay {

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address _storageAddress)
        public StablePay(_storageAddress) {
        version = 1;
    }

    /** Methods */

    function _getFeeAmount(StablePayCommon.Order order)
    public
    view
    returns (uint256) {
        return super.getFeeAmount(order);
    }
}