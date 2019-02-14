pragma solidity 0.4.25;

interface ISettings {

    /** Events */
    
    /**
        @dev This event is emitted when the StablePay platform is paused due to maintenance reasons.
     */
    event PlatformPaused (
        address indexed thisContract,
        string reason
    );

    /**
        @dev This event is emitted when the StablePay platform is unpaused.
     */
    event PlatformUnpaused (
        address indexed thisContract,
        string reason
    );

    /**
        @dev This event is emitted when the platform fee is updated.
     */
    event PlatformFeeUpdated (
        address indexed thisContract,
        uint16 oldPlatformFee,
        uint16 newPlatformFee
    );

    /**
        @dev This event is emitted when a token availability is updated.
     */
    event TokenAvailabilityUpdated (
        address indexed thisContract,
        address tokenAddress,
        uint256 minAmount,
        uint256 maxAmount,
        bool enabled
    );

    /** Functions */

    function setPlatformFee(uint16 _fee) external returns (bool);

    function getPlatformFee() external view returns (uint16);

    function pausePlatform(string _reason) external returns (bool);

    function unpausePlatform(string _reason) external returns (bool);

    function isPlatformPaused() external view returns (bool);

    function disableTokenAvailability(address _tokenAddress) external returns (bool);

    function getTokenAvailability(address _tokenAddress) external view returns (bool available, uint256 minAmount, uint256 maxAmount);

    function setTokenAvailability(address _tokenAddress, uint256 _minAmount, uint256 _maxAmount) external returns (bool);

}
