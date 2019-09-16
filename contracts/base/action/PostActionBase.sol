pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../../base/Base.sol";
import "../../interface/IPostAction.sol";
import "../../util/AddressLib.sol";

/**
    @title It is the base contract for the Post Action implementations.

    @author StablePay <hi@stablepay.io>
 */
contract PostActionBase is Base, IPostAction {
    using AddressLib for address;

    /** Constants */

    string internal constant STABLEPAY_NAME = "StablePay";

    /** Properties */

    /** Events */

    /** Modifiers */

    /**
        @notice It checks whether the address is the StablePay contract address.
        @dev It throws a require error, if the address is not equals to the StablePay contract.
        @param anAddress address to be checked.
     */
    modifier isStablePay(address anAddress) {
        getStablePayAddress().requireEqualTo(anAddress, "Address must be StablePay");
        _;
    }

    /** Constructor */

    /**
        @notice It creates a new PostActionBase instance associated to an Eternal Storage implementation.
        @param storageAddress the Eternal Storage implementation.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress) public Base(storageAddress) {}

    /** Fallback Method */

    /** Functions */

    /**
        @notice It gets the StablePay address registered in the platform.
        @return the current StablePay smart contract address.
     */
    function getStablePayAddress() internal view returns (address) {
        return
            _storage.getAddress(
                keccak256(abi.encodePacked(CONTRACT_NAME, STABLEPAY_NAME))
            );
    }
}
