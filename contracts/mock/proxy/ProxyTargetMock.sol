pragma solidity 0.5.10;

import "../../base/Base.sol";

contract ProxyTargetMock is Base {
    /** Constants */

    /** Variables */
    uint256 public value;

    /** Events */

    /** Modifiers */

    /** Constructor */
    constructor(address _storage) public Base(_storage) {}

    function setValue(uint256 _newValue) public {
        require(_newValue > 0, "New value must > 0.");
        value = _newValue;
    }
}
