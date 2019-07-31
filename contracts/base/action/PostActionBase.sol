pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../../services/erc20/ERC20.sol";
import "../../base/Base.sol";
import "../../interface/IPostAction.sol";

contract PostActionBase is Base, IPostAction {
    /** Constants */

    string internal constant STABLEPAY_NAME = "StablePay";

    /** Properties */

    /** Events */

    /** Modifiers */

    modifier isStablePay(address _anAddress) {
        require(
            getStablePayAddress() == _anAddress,
            "Address must be StablePay"
        );
        _;
    }

    /** Constructor */

    constructor(address storageAddress) public Base(storageAddress) {}

    /** Fallback Method */

    /** Functions */

    function getStablePayAddress() internal view returns (address) {
        return
            _storage.getAddress(
                keccak256(abi.encodePacked(CONTRACT_NAME, STABLEPAY_NAME))
            );
    }
}
