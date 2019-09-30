pragma solidity 0.5.10;

import "./Base.sol";
import "../interface/ISettings.sol";
import "../util/AddressLib.sol";

/**
    @title This manages the settings for the platform.
    @author StablePay <hi@stablepay.io>

    @notice It allows configure some aspect in the platform once it is deployed.
 */
contract Settings is Base, ISettings {
    using AddressLib for address;

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

    function setPlatformFee(uint16 _fee)
        external
        onlySuperUser()
        nonReentrant()
    {
        uint16 oldPlatformFee = _storage.getUint16(
            keccak256(abi.encodePacked(PLATFORM_FEE))
        );
        _storage.setUint16(keccak256(abi.encodePacked(PLATFORM_FEE)), _fee);
        emit PlatformFeeUpdated(address(this), oldPlatformFee, _fee);
    }

    /**
        @notice It pauses the platform in emergency cases.
        @dev The sender must be a super user (owner or admin) only.
        @param reason the reason why the platform is being paused.
     */
    function pausePlatform(string calldata reason)
        external
        onlySuperUser()
        nonReentrant()
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
        onlySuperUser()
        nonReentrant()
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

    function disableTokenAvailability(address tokenAddress)
        external
        onlySuperUser()
        nonReentrant()
    {
        tokenAddress.requireNotEmpty("Token address must not be eq 0x0.");
        (bool available, , ) = getTokenAvailabilityInternal(tokenAddress);
        require(available, "Token availability is already disabled.");

        _storage.setBool(
            keccak256(abi.encodePacked(TOKEN_AVAILABLE, tokenAddress)),
            false
        );
        _storage.setUint(
            keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, tokenAddress)),
            0
        );
        _storage.setUint(
            keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, tokenAddress)),
            0
        );

        emit TokenAvailabilityUpdated(address(this), tokenAddress, 0, 0, false);
    }

    function getTokenAvailability(address tokenAddress)
        external
        view
        returns (bool available, uint256 minAmount, uint256 maxAmount)
    {
        return getTokenAvailabilityInternal(tokenAddress);
    }

    function getTokenAvailabilityInternal(address tokenAddress)
        internal
        view
        returns (bool available, uint256 minAmount, uint256 maxAmount)
    {
        available = _storage.getBool(
            keccak256(abi.encodePacked(TOKEN_AVAILABLE, tokenAddress))
        );
        minAmount = _storage.getUint(
            keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, tokenAddress))
        );
        maxAmount = _storage.getUint(
            keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, tokenAddress))
        );
        return (available, minAmount, maxAmount);
    }

    function setTokenAvailability(
        address tokenAddress,
        uint256 minAmount,
        uint256 maxAmount
    ) external onlySuperUser() nonReentrant() {
        tokenAddress.requireNotEmpty("Token address must not be eq 0x0.");
        require(minAmount > 0, "Min amount is not gt 0.");
        require(minAmount < maxAmount, "Min amount is not lt max amount.");
        _storage.setBool(
            keccak256(abi.encodePacked(TOKEN_AVAILABLE, tokenAddress)),
            true
        );
        _storage.setUint(
            keccak256(abi.encodePacked(TOKEN_MIN_AMOUNT, tokenAddress)),
            minAmount
        );
        _storage.setUint(
            keccak256(abi.encodePacked(TOKEN_MAX_AMOUNT, tokenAddress)),
            maxAmount
        );

        emit TokenAvailabilityUpdated(
            address(this),
            tokenAddress,
            minAmount,
            maxAmount,
            true
        );
    }

    function isTokenAvailable(address tokenAddress, uint256 amount)
        external
        view
        returns (bool)
    {
        (bool available, uint256 minAmount, uint256 maxAmount) = getTokenAvailabilityInternal(
            tokenAddress
        );
        return available && amount >= minAmount && amount <= maxAmount;
    }
}
