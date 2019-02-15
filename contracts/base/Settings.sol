pragma solidity 0.4.25;

import "./Base.sol";
import "../interface/ISettings.sol";

contract Settings is Base, ISettings {

    /** Constructor */

    constructor(address _storageAddress)
    public
    Base(_storageAddress) {
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
    onlySuperUser
    returns (bool) {
        uint16 oldPlatformFee = _storage.getUint16(keccak256(abi.encodePacked(PLATFORM_FEE)));
        _storage.setUint16(keccak256(abi.encodePacked(PLATFORM_FEE)), _fee);
        emit PlatformFeeUpdated(
            address(this),
            oldPlatformFee,
            _fee
        );
        return true;
    }

    function pausePlatform(string _reason)
    external
    onlySuperUser
    returns (bool) {
        _storage.setBool(keccak256(abi.encodePacked(STATE_PAUSED)), true);

        emit PlatformPaused(
            address(this),
            _reason
        );
    }

    function unpausePlatform(string _reason)
    external
    onlySuperUser
    returns (bool) {
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
        uint256 minAmount = _storage.getUint(keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, _tokenAddress)));
        uint256 maxAmount = _storage.getUint(keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, _tokenAddress)));

        emit TokenAvailabilityUpdated(
            address(this),
            _tokenAddress,
            minAmount,
            maxAmount,
            false
        );
        return true;
    }

    function getTokenAvailability(address _tokenAddress)
    external
    view
    returns (bool available, uint256 minAmount, uint256 maxAmount){
        available = _storage.getBool(keccak256(abi.encodePacked(TOKEN_AVAILABLE, _tokenAddress)));
        minAmount = _storage.getUint(keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, _tokenAddress)));
        maxAmount = _storage.getUint(keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, _tokenAddress)));
        return (available, minAmount, maxAmount);
    }

    function setTokenAvailability(address _tokenAddress, uint256 _minAmount, uint256 _maxAmount)
    external
    onlySuperUser
    returns (bool) {
        require(_minAmount < _maxAmount, "Min amount < max amount.");
        _storage.setBool(keccak256(abi.encodePacked(TOKEN_AVAILABLE, _tokenAddress)), true);
        _storage.setUint(keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, _tokenAddress)), _minAmount);
        _storage.setUint(keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, _tokenAddress)), _maxAmount);

        emit TokenAvailabilityUpdated(
            address(this),
            _tokenAddress,
            _minAmount,
            _maxAmount,
            true
        );
        return true;
    }
}
