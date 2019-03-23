pragma solidity 0.4.25;

import "../Base.sol";
import "./DelegateProxy.sol";
import "../../interface/IStorage.sol";

contract ProxyBase is DelegateProxy, Base {

    string public targetId;

    constructor(address _storage, string _targetId) public Base(_storage) {
        targetId = _targetId;
    }

    function () public payable {
        address target = getTargetAddress(targetId);
        require(target != 0x0, "Target address != 0x0"); // if contract code hasn't been set yet, don't call
        delegatedFwd(target, msg.data);
    }

    function getTargetId() external view returns (string) {
        return targetId;
    }

    function getTargetAddress(string _targetId) internal view returns (address) {
        return _storage.getAddress(keccak256(abi.encodePacked("contract.name", _targetId)));
    }
}