pragma solidity 0.5.3;

import "./IOwnable.sol";

/**
    @title This manages the roles to access to the platform.
    @author StablePay <hi@stablepay.io>
    @notice This smart contract manages the roles for each address who access to the platform.
 */
contract IRole is IOwnable {

    /** Constants */

    /** Events */

    /**
        @notice This event is emitted when a new role is added.
        @param anAddress address where the role was added.
        @param roleName role name associated to the address.
    */
    event RoleAdded(
        address indexed anAddress,
        string roleName
    );

    /**
        @notice This event is emitted when a role is removed.
        @param anAddress address where the role was removed.
        @param roleName role name removed from the address.
    */
    event RoleRemoved(
        address indexed anAddress,
        string roleName
    );

    /**
        @notice This event is emitted when the platform owneship is transferred to a new address.
        @param previousOwner address which was the previous owner.
        @param newOwner address which represents the new owner.
    */
    event OwnershipTransferred(
        address indexed previousOwner, 
        address indexed newOwner
    );

    /** Modifier */

    /** Functions */

    /**
        @notice It adds a role to a specific address.
        @dev The sender must be a super user (owner or admin) only.

        @param role the role name to give to the address.
        @param anAddress the address which will receive the role.
        @return true if the role is added. Otherwise it returns false.
     */
    function adminRoleAdd(string calldata role, address anAddress)
    external
    returns (bool);

    /**
        @notice It removes a role to a specific address.
        @dev The sender must be a super user (owner or admin).

        @param role the role name to remove from the address.
        @param anAddress the address which will be removed from the role.
        @return true if the role is removed. Otherwise it returns false.
     */
    function adminRoleRemove(string calldata role, address anAddress)
    external
    returns (bool);
}