pragma solidity 0.4.25;

import "../interface/IStorage.sol";


/**
     
     
     @notice Reentrancy Guard: Remco Bloemen <remco@2π.com>: If you mark a function `nonReentrant`, you should also mark it `external`.
 */
contract Base {
    /** Constants */

    uint256 constant internal AVOID_DECIMALS = 100000000000000;
    string constant internal STATE_PAUSED = "state.paused";
    string constant internal PLATFORM_FEE = "config.platform.fee";

    string constant internal CONTRACT_NAME = "contract.name";
    string constant internal CONTRACT_ADDRESS = "contract.address";

    string constant internal OWNER = "owner";
    string constant internal ADMIN = "admin";
    string constant internal ACCESS_ROLE = "access.role";

    string constant internal TOKEN_AVAILABLE = "token.available";
    string constant internal TOKEN_MAX_AMOUNT = "token.maxAmount";
    string constant internal TOKEN_MIN_AMOUNT = "token.minAmount";

    /** Properties */
    uint8 public version;  // Version of this contract

    /**
    * @dev We use a single lock for the whole contract.
    */
    bool private rentrancy_lock = false;

    /**
        @dev The main storage contract where primary persistant storage is maintained    
     */
    IStorage public _storage = IStorage(0);     

    /** Events */

    /**
        @dev This event is emitted when a deposit is received.
     */
    event DepositReceived (
        address indexed thisContract,
        address from,
        uint amount
    );

    /**
        @dev This event is emitted when a new payment is sent to an address.
     */
    event PaymentSent(
        address indexed thisContract,
        address merchant,
        address customer,
        address sourceToken,
        address targetToken,
        uint amount
    );

    /** Modifiers */

    /**
    * @dev Prevents a contract from calling itself, directly or indirectly.
    * @notice If you mark a function `nonReentrant`, you should also
    * mark it `external`. Calling one nonReentrant function from
    * another is not supported. Instead, you can implement a
    * `private` function doing the actual work, and a `external`
    * wrapper marked as `nonReentrant`.
    */
    modifier nonReentrant() {
        require(!rentrancy_lock, "rentrancy_lock");
        rentrancy_lock = true;
        _;
        rentrancy_lock = false;
    }

    /**
    * @dev Throws if called by any account other than the owner.
    */
    modifier onlyOwner() {
        roleCheck(OWNER, msg.sender);
        _;
    }

    /**
    * @dev Modifier to scope access to admins
    */
    modifier onlyAdmin() {
        roleCheck(ADMIN, msg.sender);
        _;
    }

    /**
    * @dev Modifier to scope access to admins
    */
    modifier onlySuperUser() {
        require(
            roleHas(OWNER, msg.sender) == true || 
            roleHas(ADMIN, msg.sender) == true,
            "Msg sender does not have permission."
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
        return _storage.getBool(keccak256(abi.encodePacked(ACCESS_ROLE, _role, _address)));
    }

    /**
    * @dev Check if an address has this role, reverts if it doesn't
    */
    function roleCheck(string _role, address _address) internal view {
        require(roleHas(_role, _address) == true, "Invalid role");
    }
}