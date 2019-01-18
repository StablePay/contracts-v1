pragma solidity 0.4.25;

import "../interface/IStorage.sol";

contract Base {
    /** Constants */

    string constant internal STATE_PAUSED = "state.paused";
    string constant internal PLATFORM_FEE = "config.platform.fee";

    string constant internal CONTRACT_NAME = "contract.name";
    string constant internal CONTRACT_ADDRESS = "contract.address";

    /** Properties */
    uint8 public version;  // Version of this contract

    /**
        @dev The main storage contract where primary persistant storage is maintained    
     */
    IStorage public _storage = IStorage(0);     

    /** Modifiers */
    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        roleCheck("owner", msg.sender);
        _;
    }

    /**
    * @dev Modifier to scope access to admins
    */
    modifier onlyAdmin() {
        roleCheck("admin", msg.sender);
        _;
    }

    /**
    * @dev Modifier to scope access to admins
    */
    modifier onlySuperUser() {
        require(
            roleHas("owner", msg.sender) == true || 
            roleHas("admin", msg.sender) == true
        );
        _;
    }

    /**
    * @dev Reverts if the address doesn't have this role
    */
    modifier onlyRole(string _role) {
        roleCheck(_role, msg.sender);
        _;
    }

    /**
        @dev This modifier checks whether the platform is in paused state.
     */
    modifier isNotPaused() {
        require(_storage.getBool(keccak256(abi.encodePacked(STATE_PAUSED))) == false, "Platform is paused.");
        _;
    }

  
    /** Constructor */
   
    /**
        @dev Set the main Storage address
     */
    constructor(address _storageAddress) public {
        // Update the contract address
        _storage = IStorage(_storageAddress);
    }


    /** Role utilities */

    /**
    * @dev Check if an address has this role
    * @return bool
    */
    function roleHas(string _role, address _address) internal view returns (bool) {
        return _storage.getBool(keccak256(abi.encodePacked("access.role", _role, _address)));
    }

    /**
    * @dev Check if an address has this role, reverts if it doesn't
    */
    function roleCheck(string _role, address _address) internal view {
        require(roleHas(_role, _address) == true);
    }
}