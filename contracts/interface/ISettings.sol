pragma solidity 0.5.10;

/**
    @notice This is an abstraction for the settings in the platform.
    @notice This contract is used to pause/unpause the platform for security reasons.
    @notice Also it is used to configure min/max amount of target tokens in swapping process.
 
    @author StablePay <hi@stablepay.io>
 */
interface ISettings {
    /** Events */

    /**
        @notice This event is emitted when the platform is paused due to maintenance reasons.
     */
    event PlatformPaused(address indexed thisContract, string reason);

    /**
        @notice This event is emitted when the platform is unpaused.
     */
    event PlatformUnpaused(address indexed thisContract, string reason);

    /**
        @notice This event is emitted when the platform fee is updated.
     */
    event PlatformFeeUpdated(
        address indexed thisContract,
        uint16 oldPlatformFee,
        uint16 newPlatformFee
    );

    /**
        @notice This event is emitted when a token availability is updated.
     */
    event TokenAvailabilityUpdated(
        address indexed thisContract,
        address tokenAddress,
        uint256 minAmount,
        uint256 maxAmount,
        bool enabled
    );

    /** Functions */

    /**
        @notice It sets the platform fee.
        @dev This function only can be invoke by an owner or admin user.
        @dev The value must be multiplied by 100 before calling this function.
        @dev Example: Platform fee: 1% => The value to invoke the function must be: 100.
     */
    function setPlatformFee(uint16 fee) external;

    /**
        @notice It gets the current platform fee.
        @dev The value is multiplied by 100.
        @return the current platform fee multiplied by 100.
     */
    function getPlatformFee() external view returns (uint16);

    /**
        @notice It pauses the platform in emergency cases.
        @dev The sender must be a super user (owner or admin) only.
        @param reason the reason why the platform is being paused.
     */
    function pausePlatform(string calldata reason) external;

    /**
        @notice It unpauses the platform in when an emergency issue was fixed.
        @dev The sender must be a super user (owner or admin) only.
        @param reason the reason why the platform is being unpaused.
     */
    function unpausePlatform(string calldata reason) external;

    /**
        @notice It gets whether the platform is paused or not.
        @return true if the platform is paused. Otherwise it returns false.
     */
    function isPlatformPaused() external view returns (bool);

    /**
        @notice It disables a token address as a target token in the platform.
        @dev This function only can be invoke by an owner or admin user.
        @param tokenAddress ERC20 address to disable. 
     */
    function disableTokenAvailability(address tokenAddress)
        external;

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
        returns (bool available, uint256 minAmount, uint256 maxAmount);

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
    ) external;

    /**
        @notice It gets whether a specific token address and amount is available.
        @param tokenAddress ERC20 token address to test.
        @param amount amount of tokens to test.
        @return true if the amount of tokens (tokenAddress) are available to swap. Otherwise it returns false.
     */
    function isTokenAvailable(address tokenAddress, uint256 amount)
        external
        view
        returns (bool);

}
