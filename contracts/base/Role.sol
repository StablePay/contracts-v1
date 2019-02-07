pragma solidity 0.4.25;

import "./Base.sol";

contract Role is Base {

    /** Events */

    event RoleAdded(
        address indexed anAddress,
        string roleName
    );

    event RoleRemoved(
        address indexed anAddress,
        string roleName
    );

    event OwnershipTransferred(
        address indexed previousOwner, 
        address indexed newOwner
    );

    /** Modifier */

    /**
        @dev Only allow access from the latest version of the RocketRole contract
     */
    modifier onlyLatestRole() {
        require(address(this) == _storage.getAddress(keccak256(abi.encodePacked("contract.name", "role"))));
        _;
    }
  
    /** Constructor */

    constructor(address _storageAddress)  public Base(_storageAddress) {
        // Set the version
        version = 1;
    }

     /**
    * @dev Allows the current owner to transfer control of the contract to a newOwner.
    * @param _newOwner The address to transfer ownership to.
    */
    function transferOwnership(address _newOwner) public onlyLatestRole onlyOwner {
        // Legit address?
        require(_newOwner != 0x0);
        // Check the role exists 
        roleCheck("owner", msg.sender);
        // Remove current role
        _storage.deleteBool(keccak256(abi.encodePacked("access.role", "owner", msg.sender)));
        // Add new owner
        _storage.setBool(keccak256(abi.encodePacked("access.role", "owner", _newOwner)), true);

        emit OwnershipTransferred(msg.sender, _newOwner);
    }

    /** Admin Role Methods */

   /**
   * @dev Give an address access to this role
   */
    function adminRoleAdd(string _role, address _address) public onlyLatestRole onlySuperUser {
        roleAdd(_role, _address);
    }

    /**
   * @dev Remove an address access to this role
   */
    function adminRoleRemove(string _role, address _address) public onlyLatestRole onlySuperUser {
        roleRemove(_role, _address);
    }

    /** Internal Role Methods */
   
    /**
   * @dev Give an address access to this role
   */
    function roleAdd(string _role, address _address) internal {
        // Legit address?
        require(_address != 0x0);
        // Only one owner to rule them all
        require(keccak256(abi.encodePacked(_role)) != keccak256("owner"));
        // Add it
        _storage.setBool(keccak256(abi.encodePacked("access.role", _role, _address)), true);
        // Log it
        emit RoleAdded(_address, _role);
    }

    /**
    * @dev Remove an address' access to this role
    */
    function roleRemove(string _role, address _address) internal {
        // Only an owner can transfer their access
        require(!roleHas("owner", _address));
        // Remove from storage
        _storage.deleteBool(keccak256(abi.encodePacked("access.role", _role, _address)));
        // Log it
        emit RoleRemoved(_address, _role);
    }
}