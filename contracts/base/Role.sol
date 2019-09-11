pragma solidity 0.5.10;

import "./Base.sol";
import "../interface/IRole.sol";

/**
    @title This manages the roles to access to the platform.
    @author StablePay <hi@stablepay.io>
    @notice This smart contract manages the roles for each address who access to the platform.
 */
contract Role is Base, IRole {
    /** Constants */
    string internal constant ROLE_NAME = "Role";

    /** Events */

    /** Modifier */

    /**
        @notice It checks whether this smart contract is the last version.
        @dev It checks getting the address for the contract name 'Role'.
        @dev If it is not the last version, it throws a require error.
     */
    modifier onlyLatestRole() {
        require(
            address(this) ==
                _storage.getAddress(
                    keccak256(abi.encodePacked(CONTRACT_NAME, ROLE_NAME))
                ),
            "Only the latest version contract."
        );
        _;
    }

    /** Constructor */

    /**
        @notice It creates a new Role instance associated to an Eternal Storage implementation.
        @param storageAddress the Eternal Storage implementation.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress) public Base(storageAddress) {}

    /**
        @notice It transfers the ownership of the platform to another address.
        @dev After transfering ownership, if the execution was as expected, it needs to call 'deleteOwner' function.
        @param newOwner The address to transfer ownership to.
     */
    function transferOwnership(address newOwner)
        external
        onlyLatestRole
        onlyOwner
    {
        // Legit address?
        require(newOwner != address(0x0), "New owner must be != 0x0.");

        // Check the role exists
        roleCheck("owner", msg.sender);

        // Add new owner
        _storage.setBool(
            keccak256(abi.encodePacked("access.role", "owner", newOwner)),
            true
        );

        emit OwnershipTransferred(msg.sender, newOwner);
    }

    /**
        @notice It removes the owner from the platform.
        @dev It needs to be executed after transfering the ownership to a new address.
     */
    function deleteOwner()
        external
        onlyLatestRole
        onlyOwner
        returns (bool)
    {
        roleCheck("owner", msg.sender);

        _storage.deleteBool(
            keccak256(abi.encodePacked("access.role", "owner", msg.sender))
        );

        emit OwnerRemoved(
            address(this),
            msg.sender,
            now
        );
        return true;
    }

    /** Admin Role Methods */

    /**
        @notice It adds a role to a specific address.
        @dev The sender must be a super user (owner or admin) only.

        @param aRole the role name to give to the address.
        @param anAddress the address which will receive the role.
        @return true if the role is added. Otherwise it returns false.
     */
    function adminRoleAdd(string calldata aRole, address anAddress)
        external
        onlyLatestRole
        onlySuperUser
        returns (bool)
    {
        roleAdd(aRole, anAddress);
        return true;
    }

    /**
        @notice It removes a role to a specific address.
        @dev The sender must be a super user (owner or admin).

        @param aRole the role name to remove from the address.
        @param anAddress the address which will be removed from the role.
        @return true if the role is removed. Otherwise it returns false.
     */
    function adminRoleRemove(string calldata aRole, address anAddress)
        external
        onlyLatestRole
        onlySuperUser
        returns (bool)
    {
        roleRemove(aRole, anAddress);
        return true;
    }

    /** Internal Role Methods */

    /**
        @notice It gives a role to a specific address.
        
        @param _role the role name to give to the address.
        @param _address the address which will receive the role.
     */
    function roleAdd(string memory _role, address _address) internal {
        // Legit address?
        require(_address != address(0x0), "Address != 0x0.");
        require(
            keccak256(abi.encodePacked(_role)) != keccak256(""),
            "Role must not be empty."
        );

        // Only one owner to rule them all
        require(
            keccak256(abi.encodePacked(_role)) != keccak256("owner"),
            "Only one owner."
        );
        // Add it
        _storage.setBool(
            keccak256(abi.encodePacked("access.role", _role, _address)),
            true
        );
        // Log it
        emit RoleAdded(_address, _role);
    }

    /**
        @notice It removes a role to a specific address.

        @param _role the role name to remove from the address.
        @param _address the address which will be removed from the role.
     */
    function roleRemove(string memory _role, address _address) internal {
        // Only an owner can transfer their access
        require(
            !roleHas("owner", _address),
            "Only owner can transfer their access."
        );
        // Remove from storage
        _storage.deleteBool(
            keccak256(abi.encodePacked("access.role", _role, _address))
        );
        // Log it
        emit RoleRemoved(_address, _role);
    }
}
