pragma solidity 0.5.10;

import "./base/proxy/ProxyBase.sol";

contract StablePay is ProxyBase {
    /** Constants */
    string public constant STABLE_PAY = "StablePayBase";

    /** Variables */

    /** Events */

    /** Modifiers */

    /** Constructor */
    constructor(address storageAddress)
        public
        ProxyBase(storageAddress, STABLE_PAY)
    {}

    /**
    * @dev ERC897, the address the proxy would delegate calls to
    */
    function implementation() external view returns (address) {
        return getTargetAddress(targetId);
    }

    /**
     * @dev ERC897, whether it is a forwarding (1) or an upgradeable (2) proxy
     */
    function proxyType() external pure returns (uint256 proxyTypeId) {
        return UPGRADEABLE;
    }
}
