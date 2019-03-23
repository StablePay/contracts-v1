pragma solidity 0.4.25;

import "./base/proxy/ProxyBase.sol";

contract StablePay is ProxyBase {
    
    /** Constants */
    string constant public STABLE_PAY = "StablePay";

    /** Variables */

    /** Events */

    /** Modifiers */

    /** Constructor */
    constructor(address _storage)
      ProxyBase(_storage, STABLE_PAY)
      public {
    }

    /**
    * @dev ERC897, the address the proxy would delegate calls to
    */
    function implementation() public view returns (address) {
        return getTargetAddress(targetId);
    }

    /**
     * @dev ERC897, whether it is a forwarding (1) or an upgradeable (2) proxy
     */
    function proxyType() public pure returns (uint256 proxyTypeId) {
        return UPGRADEABLE;
    }
}