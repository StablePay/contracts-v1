pragma solidity 0.5.3;

/**
    @title This allows to register new smart contract in the platform.
    @author StablePay <hi@stablepay.io>

    @notice It is used to add new features to the platform which needs new smart contracts.
    @dev It must be executed by an owner.
 */
contract IRegistration {
    /** Events */

    /**
        @notice This event is emitted when a new smart contract is registered.
     */
    event NewContractRegistered(
        address indexed thisContract,
        address indexed contractAddress,
        string contractName
    );

    /** Functions */

    /**
        @notice It registers a new smart contract associated to a contract name in the platform.
        @dev It must be executed by an owner platform only.
        @param contractName smart contract name to be registered.
        @param contractAddress the new smart contract address.
        @return true if the contract is registered. Otherwise it returns false.
     */
     // TODO Does it need to have a unregisterContract to remove storage address/name?
    function registerContract(
        string calldata contractName,
        address contractAddress
    ) external returns (bool);

    /**
        @notice It gets the contract address associated to a specific contract name in the platform.
        @param contractName smart contract name to look for its associated address.
        @return the address associated to a contract name.
     */
    function getContractAddress(
        string calldata contractName
    ) external view returns (address);
}
