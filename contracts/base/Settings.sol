pragma solidity 0.4.25;

import "./Base.sol";
import "../interface/ISettings.sol";

contract Settings is Base { // TODO Check failure in deployment with the interface , ISettings {

    /** Events */
    event PlatformPaused (
        address indexed thisContract,
        string reason
    );

    event PlatformUnpaused (
        address indexed thisContract,
        string reason
    );

    event PlatformFeeUpdated (
        address indexed thisContract,
        uint16 oldPlatformFee,
        uint16 newPlatformFee
    );

    event TokenAvailabilityUpdated (
        address indexed thisContract,
        address tokenAddress,
        uint256 amount,
        bool enabled
    );

    /** Constructor */

    constructor(address _storageAddress)
        public Base(_storageAddress) {
            version = 1;
    }

    /** Modifiers */

    /** Functions */

    function getPlatformFee()
    external
    view
    returns (uint16){
        return _storage.getUint16(keccak256(abi.encodePacked(PLATFORM_FEE)));
    }

    function setPlatformFee(uint16 _fee)
    external
    onlySuperUser {
        uint16 oldPlatformFee = _storage.getUint16(keccak256(abi.encodePacked(PLATFORM_FEE)));
        _storage.setUint16(keccak256(abi.encodePacked(PLATFORM_FEE)), _fee);
        emit PlatformFeeUpdated(
            address(this),
            oldPlatformFee,
            _fee
        );
    }

    function pausePlatform(string _reason) external onlySuperUser {
        _storage.setBool(keccak256(abi.encodePacked(STATE_PAUSED)), true);

        emit PlatformPaused(
            address(this),
            _reason
        );
    }

    function unpausePlatform(string _reason) external onlySuperUser {
        _storage.setBool(keccak256(abi.encodePacked(STATE_PAUSED)), false);

        emit PlatformUnpaused(
            address(this),
            _reason
        );
    }

    function isPlatformPaused() external view returns (bool) {
        return _storage.getBool(keccak256(abi.encodePacked(STATE_PAUSED)));
    }

    function disableTokenAvailability(address _tokenAddress)
    external
    onlySuperUser
    returns (bool){
        _storage.setBool(keccak256(abi.encodePacked(TOKEN_AVAILABLE, _tokenAddress)), false);
        uint256 amount = _storage.getUint(keccak256(abi.encodePacked(TOKEN_AMOUNT, _tokenAddress)));

        emit TokenAvailabilityUpdated(
            address(this),
            _tokenAddress,
            amount,
            false
        );
        return true;
    }

    function getTokenAvailability(address _tokenAddress)
    external
    view
    returns (bool available, uint256 amount){
        available = _storage.getBool(keccak256(abi.encodePacked(TOKEN_AVAILABLE, _tokenAddress)));
        amount = _storage.getUint(keccak256(abi.encodePacked(TOKEN_AMOUNT, _tokenAddress)));
        return (available, amount);
    }

    function setTokenAvailability(address _tokenAddress, uint256 _amount)
    external
    onlySuperUser
    returns (bool) {
        _storage.setBool(keccak256(abi.encodePacked(TOKEN_AVAILABLE, _tokenAddress)), true);
        _storage.setUint(keccak256(abi.encodePacked(TOKEN_AMOUNT, _tokenAddress)), _amount);

        emit TokenAvailabilityUpdated(
            address(this),
            _tokenAddress,
            _amount,
            true
        );
        return true;
    }
}
