pragma solidity 0.5.10;

import "./Base.sol";
import "../interface/IUpgrade.sol";

/**
    @title This allows to upgrade any smart contract of the platform.
    @author StablePay <hi@stablepay.io>

    @notice It is used in some emergency situation where the platform needs to be fixed.
    @dev It must be executed by an owner.
 */
contract Upgrade is Base, IUpgrade {
    /** Constants */
    string internal constant CONTRACT_ADDRESS = "contract.address";

    /** Events */

    /** Constructor */

    /**
        @notice It creates a new Upgrade instance associated to an Eternal Storage implementation.
        @param _storageAddress the Eternal Storage implementation.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address _storageAddress) public Base(_storageAddress) {}

    /** Functions */

    /**
        @notice It upgrades a smart contract of the platform associated to a contract name.
        @dev It must be executed by an owner platform only.
        @param name smart contract name to be upgraded.
        @param upgradedContractAddress the new smart contract address.
     */
    function upgradeContract(string calldata name, address upgradedContractAddress)
        external
        onlySuperUser()
        nonReentrant()
    {
        require(
            upgradedContractAddress != address(0x0),
            "Upgraded contract addresses must not be 0x0."
        );
        address oldContractAddress = _storage.getAddress(
            keccak256(abi.encodePacked(CONTRACT_NAME, name))
        );

        require(
            oldContractAddress != address(0x0),
            "Old contract address must not be 0x0."
        );
        require(
            oldContractAddress != upgradedContractAddress,
            "Old and new contract addresses must not be equals."
        );
        uint256 oldContractBalance = oldContractAddress.balance;

        if (oldContractBalance > 0) {
            emit PendingBalance(
                address(this),
                oldContractAddress,
                upgradedContractAddress,
                name,
                oldContractBalance
            );
        }

        _storage.setAddress(
            keccak256(abi.encodePacked(CONTRACT_NAME, name)),
            upgradedContractAddress
        );
        _storage.setAddress(
            keccak256(abi.encodePacked(CONTRACT_ADDRESS, upgradedContractAddress)),
            upgradedContractAddress
        );
        _storage.deleteAddress(
            keccak256(abi.encodePacked(CONTRACT_ADDRESS, oldContractAddress))
        );

        emit ContractUpgraded(
            address(this),
            oldContractAddress,
            upgradedContractAddress,
            name
        );
    }
}
