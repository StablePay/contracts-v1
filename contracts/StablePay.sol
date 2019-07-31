pragma solidity 0.5.3;

import "./base/proxy/ProxyBase.sol";

contract StablePay is ProxyBase {
    
    /** Constants */
    string constant public STABLE_PAY = "StablePayBase";

    /** Variables */

    /** Events */

    /** Modifiers */

    /** Constructor */
    constructor(address storageAddress)
      ProxyBase(storageAddress, STABLE_PAY)
      public {
    }

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