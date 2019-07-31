pragma solidity 0.5.3;

import "./Base.sol";
import "../interface/ISettings.sol";

/**
    @title This manages the settings for the platform.
    @author StablePay <hi@stablepay.io>

    @notice It allows configure some aspect in the platform once it is deployed.
 */
contract Settings is Base, ISettings {
    /** Constants */

    string internal constant TOKEN_AVAILABLE = "token.available";
    string internal constant TOKEN_MAX_AMOUNT = "token.maxAmount";
    string internal constant TOKEN_MIN_AMOUNT = "token.minAmount";
    string internal constant PLATFORM_FEE = "config.platform.fee";

    /** Constructor */

    /**
        @notice It creates a new Role instance associated to an Eternal Storage implementation.
        @param storageAddress the Eternal Storage implementation.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress) public Base(storageAddress) {}

    /** Modifiers */

    /** Functions */

    function getPlatformFee() external view returns (uint16) {
        return _storage.getUint16(keccak256(abi.encodePacked(PLATFORM_FEE)));
    }

    function setPlatformFee(uint16 _fee) external onlySuperUser returns (bool) {
        uint16 oldPlatformFee = _storage.getUint16(
            keccak256(abi.encodePacked(PLATFORM_FEE))
        );
        _storage.setUint16(keccak256(abi.encodePacked(PLATFORM_FEE)), _fee);
        emit PlatformFeeUpdated(address(this), oldPlatformFee, _fee);
        return true;
    }

    /**
        @notice It pauses the platform in emergency cases.
        @dev The sender must be a super user (owner or admin) only.

        @param reason the reason why the platform is being paused.
     */
    function pausePlatform(string calldata reason)
        external
        onlySuperUser
        returns (bool)
    {
        _storage.setBool(keccak256(abi.encodePacked(STATE_PAUSED)), true);

        emit PlatformPaused(address(this), reason);
    }

    /**
        @notice It unpauses the platform in when an emergency issue was fixed.
        @dev The sender must be a super user (owner or admin) only.

        @param reason the reason why the platform is being unpaused.
     */
    function unpausePlatform(string calldata reason)
        external
        onlySuperUser
        returns (bool)
    {
        _storage.setBool(keccak256(abi.encodePacked(STATE_PAUSED)), false);

        emit PlatformUnpaused(address(this), reason);
    }

    /**
        @notice It gets whether the platform is paused or not.
        @return true if the platform is paused. Otherwise it returns false.
     */
    function _isPlatformPaused() internal view returns (bool) {
        return _storage.getBool(keccak256(abi.encodePacked(STATE_PAUSED)));
    }

    /**
        @notice It gets whether the platform is paused or not.
        @return true if the platform is paused. Otherwise it returns false.
     */
    function isPlatformPaused() external view returns (bool) {
        return _isPlatformPaused();
    }

    function disableTokenAvailability(address _tokenAddress)
        external
        onlySuperUser
        returns (bool)
    {
        _storage.setBool(
            keccak256(abi.encodePacked(TOKEN_AVAILABLE, _tokenAddress)),
            false
        );
        uint256 minAmount = _storage.getUint(
            keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, _tokenAddress))
        );
        uint256 maxAmount = _storage.getUint(
            keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, _tokenAddress))
        );

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
        returns (bool available, uint256 minAmount, uint256 maxAmount)
    {
        available = _storage.getBool(
            keccak256(abi.encodePacked(TOKEN_AVAILABLE, _tokenAddress))
        );
        minAmount = _storage.getUint(
            keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, _tokenAddress))
        );
        maxAmount = _storage.getUint(
            keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, _tokenAddress))
        );
        return (available, minAmount, maxAmount);
    }

    function setTokenAvailability(
        address _tokenAddress,
        uint256 _minAmount,
        uint256 _maxAmount
    ) external onlySuperUser returns (bool) {
        require(_minAmount < _maxAmount, "Min amount < max amount.");
        _storage.setBool(
            keccak256(abi.encodePacked(TOKEN_AVAILABLE, _tokenAddress)),
            true
        );
        _storage.setUint(
            keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, _tokenAddress)),
            _minAmount
        );
        _storage.setUint(
            keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, _tokenAddress)),
            _maxAmount
        );

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
