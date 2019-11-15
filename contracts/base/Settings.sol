pragma solidity 0.5.10;

import "./Base.sol";
import "../interface/ISettings.sol";
import "../util/AddressLib.sol";

/**
    @title This manages the settings for the platform.
    @notice This contract is used to pause/unpause the platform for security reasons.
    @notice Also it is used to configure min/max amount of target tokens in swapping process.

    @author StablePay <hi@stablepay.io>

 */
contract Settings is Base, ISettings {
    using AddressLib for address;

    /** Constants */

    /**
        @notice This is the max value for the fee. 
        @notice The platform fee is multiplied by 100.
        @notice This value is 100%: 100 * 100.
     */
    uint16 internal constant MAX_FEE_VALUE = 10000;
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

    /**
        @notice It gets the current platform fee.
        @dev The value is multiplied by 100.
        @return the current platform fee multiplied by 100.
     */
    function getPlatformFee() external view returns (uint16) {
        return _storage.getUint16(keccak256(abi.encodePacked(PLATFORM_FEE)));
    }

    /**
        @notice It sets the platform fee.
        @dev This function only can be invoke by an owner or admin user.
        @dev The value must be multiplied by 100 before calling this function.
        @dev Example: Platform fee: 1% => The value to invoke the function must be: 100.
        @dev Example: Platform fee: 0.5% => The value to invoke the function must be: 50.
     */
    function setPlatformFee(uint16 _fee)
        external
        onlySuperUser()
        nonReentrant()
    {
        require(_fee <= MAX_FEE_VALUE, "Fee must be lte 100.");
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

    /**
        @notice It disables a token address as a target token in the platform.
        @dev This function only can be invoke by an owner or admin user.
        @param tokenAddress ERC20 address to disable. 
     */
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

    /**
        @notice It gets the current tokens amount availability for specific token address.
        @notice If the token address is not available, it returns false in the available param.
        @return available true if the token address is available. Otherwise it returns false.
        @return minAmount minimum amount of tokens available.
        @return maxAmount maximum amount of tokens available.
     */
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

    /**
        @notice It configures the target token amount availability in the platform.
        @notice It is used for security reason.
        @param tokenAddress ERC20 token address to configure.
        @param minAmount minimum amount of tokens available to swap.
        @param maxAmount maximum amount of tokens available to swap.
     */
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

    /**
        @notice It gets whether a specific token address and amount is available.
        @param tokenAddress ERC20 token address to test.
        @param amount amount of tokens to test.
        @return true if the amount of tokens (tokenAddress) are available to swap. Otherwise it returns false.
     */
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
