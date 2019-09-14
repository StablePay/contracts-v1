pragma solidity 0.5.10;

import "./Base.sol";
import "../interface/IRegistration.sol";
import "../util/AddressLib.sol";

/**
    @title This allows to register new smart contract into the platform.
    @author StablePay <hi@stablepay.io>

    @notice It is used to add new features to the platform which needs new smart contracts.
    @dev It must be executed by an owner.
 */
contract Registration is Base, IRegistration {
    using AddressLib for address;

    /** Constants */
    string internal constant CONTRACT_ADDRESS = "contract.address";

    /** Events */

    /** Constructor */

    /**
        @notice It creates a new Registration instance associated to an Eternal Storage implementation.
        @param storageAddress the Eternal Storage implementation.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress) public Base(storageAddress) {}

    /** Functions */

    /**
        @notice It registers a new smart contract associated to a contract name in the platform.
        @dev It must be executed by an owner platform only.
        @param contractName smart contract name to be registered.
        @param contractAddress the new smart contract address.
        @return true if the contract is registered. Otherwise it returns false.
     */
    function registerContract(string calldata contractName, address contractAddress)
        external
        onlySuperUser()
        nonReentrant()
        returns (bool)
    {
        contractAddress.requireNotEmpty("Contract address must not be 0x0.");
        address currentContractAddress = getContractAddressInternal(contractName);
        currentContractAddress.requireEmpty("Current contract address must be 0x0.");

        _storage.setAddress(
            keccak256(abi.encodePacked(CONTRACT_NAME, contractName)),
            contractAddress
        );
        _storage.setAddress(
            keccak256(
                abi.encodePacked(CONTRACT_ADDRESS, contractAddress)
            ),
            contractAddress
        );

        emit NewContractRegistered(
            address(this),
            contractAddress,
            contractName
        );

        return true;
    }

    /**
        @notice It gets the contract address associated to a specific contract name in the platform.
        @param contractName smart contract name to look for its associated address.
        @return the address associated to a contract name.
     */
    function getContractAddress(
        string calldata contractName
    ) external view returns (address)
    {
        return getContractAddressInternal(contractName);
    }

     /**
        @notice It gets the contract address associated to a specific contract name in the platform.
        @param contractName smart contract name to look for its associated address.
        @return the address associated to a contract name.
     */
    function getContractAddressInternal(
        string memory contractName
    ) internal view returns (address)
    {
        return _storage.getAddress(keccak256(abi.encodePacked(CONTRACT_NAME, contractName)));
    }
}
