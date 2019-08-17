pragma solidity 0.5.3;

/**
    @notice This is an abstraction for the settings in the platform.
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

    // TODO Add function setCustomPlatformFee(address anAddress, uint16 customFee) external returns (bool);
    // TODO Add function getCustomPlatformFee(address anAddress) external returns (uint16);
    // TODO Add event CustomPlatformFee
    function setPlatformFee(uint16 fee) external returns (bool);

    function getPlatformFee() external view returns (uint16);

    /**
        @notice It pauses the platform in emergency cases.
        @dev The sender must be a super user (owner or admin) only.

        @param reason the reason why the platform is being paused.
     */
    function pausePlatform(string calldata reason) external returns (bool);

    /**
        @notice It unpauses the platform in when an emergency issue was fixed.
        @dev The sender must be a super user (owner or admin) only.

        @param reason the reason why the platform is being unpaused.
     */
    function unpausePlatform(string calldata reason) external returns (bool);

    /**
        @notice It gets whether the platform is paused or not.
        @return true if the platform is paused. Otherwise it returns false.
     */
    function isPlatformPaused() external view returns (bool);

    function disableTokenAvailability(address tokenAddress)
        external
        returns (bool);

    function getTokenAvailability(address tokenAddress)
        external
        view
        returns (bool available, uint256 minAmount, uint256 maxAmount);

    function setTokenAvailability(
        address tokenAddress,
        uint256 minAmount,
        uint256 maxAmount
    ) external returns (bool);

    function isTokenAvailable(
        address tokenAddress,
        uint256 amount
    ) external view returns (bool);

}
