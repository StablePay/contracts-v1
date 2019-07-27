pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../../erc20/ERC20.sol";
import "../../base/Base.sol";
import "../../interface/IPostAction.sol";

contract TransferUserPostAction is Base, IPostAction {

    /** Constants */

    /** Properties */

    address public stablePay;

    /** Events */

    /** Modifiers */

    modifier isStablePay(address _anAddress) {
        require(stablePay == _anAddress, "Address must be StablePay");
        _;
    }

    /** Constructor */

    constructor(address stablePayAddress, address storageAddress)
        public Base(storageAddress) {
        stablePay = stablePayAddress;
    }

    /** Fallback Method */

    /** Functions */

    function execute(StablePayCommon.Order memory order, uint feeAmount)
    public
    isStablePay(msg.sender)
    returns (bool){
        // Calculate the 'to' amount.
        uint256 currentToAmount = order.targetAmount.sub(feeAmount);
        // Transfer the 'to' amount to the 'to' address.
        bool result = ERC20(order.targetToken).transfer(order.toAddress, currentToAmount);
        require(result, "Transfer to 'to' address failed.");
        // return (true, currentToAmount);
        return true;
    }
}
