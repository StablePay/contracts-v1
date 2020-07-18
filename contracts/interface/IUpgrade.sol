pragma solidity 0.5.10;

/**
    @title This allows to upgrade any smart contract of the platform.
    @author StablePay <hi@stablepay.io>

    @notice It is used in some emergency situation where the platform needs to be fixed.
    @dev It must be executed by an owner.
 */
contract IUpgrade {
    /** Events */

    /**
    @notice This event is emitted when a contract is upgraded.
    @param contractAddress this smart contract address.
    @param oldContractAddress old smart contract address.
    @param newContractAddress new smart contract address.
    @param contractName contract name updated.
   */
    event ContractUpgraded(
        address indexed contractAddress,
        address indexed oldContractAddress,
        address indexed newContractAddress,
        string contractName
    );

    /**
    @notice This event is emitted when an upgraded smart contract still has Ether balance.
    @param contractAddress this smart contract address.
    @param oldContractAddress old smart contract address.
    @param newContractAddress new smart contract address.
    @param contractName contract name updated.
    @param balance current Ether balance.
   */
    event PendingBalance(
        address indexed contractAddress,
        address indexed oldContractAddress,
        address indexed newContractAddress,
        string contractName,
        uint256 balance
    );

    /** Functions */

    /**
    @notice It upgrades a smart contract of the platform associated to a contract name.
    @dev It must be executed by an owner platform only.
    @param name smart contract name to be upgraded.
    @param upgradedContractAddress the new smart contract address.
  */
    function upgradeContract(string calldata name, address upgradedContractAddress)
        external;
}
