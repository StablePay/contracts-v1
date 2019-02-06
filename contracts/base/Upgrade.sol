pragma solidity 0.4.25;

import "./Base.sol";

contract Upgrade is Base {

    /** Events */

    event ContractUpgraded (
        address indexed contractAddress,
        address indexed oldContractAddress,
        address indexed newContractAddress,
        string contractName
    );

    /** Constructor */

    constructor(address _storageAddress) Base(_storageAddress) public {
        version = 1;
    }

    /** Functions */

    function upgradeContract(string _name, address _upgradedContractAddress)  external onlySuperUser {
        address oldContractAddress = _storage.getAddress(keccak256(abi.encodePacked("contract.name", _name)));
        
        require(oldContractAddress != 0x0, "Old contract address must not be 0x0.");
        require(oldContractAddress != _upgradedContractAddress, "Old and new contract addresses must not be equals.");
        require(oldContractAddress.balance == 0, "Old contract balance must be 0.");
        
        _storage.setAddress(keccak256(abi.encodePacked(CONTRACT_NAME, _name)), _upgradedContractAddress);
        _storage.setAddress(keccak256(abi.encodePacked(CONTRACT_ADDRESS, _upgradedContractAddress)), _upgradedContractAddress);
        _storage.deleteAddress(keccak256(abi.encodePacked(CONTRACT_ADDRESS, oldContractAddress)));

        emit ContractUpgraded(address(this), oldContractAddress, _upgradedContractAddress, _name);
    }
}