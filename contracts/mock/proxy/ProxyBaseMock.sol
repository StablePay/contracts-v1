pragma solidity 0.5.10;

import "../../base/proxy/ProxyBase.sol";

contract ProxyBaseMock is ProxyBase {
    /** Constants */

    /** Variables */

    /** Events */

    /** Modifiers */

    /** Constructor */
    constructor(address _storage, string memory _targetId)
        public
        ProxyBase(_storage, _targetId)
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

    function _getTargetAddress(string memory _targetId) public view returns (address) {
        return super.getTargetAddress(_targetId);
    }
}
