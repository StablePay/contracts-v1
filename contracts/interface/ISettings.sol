pragma solidity 0.4.25;

interface ISettings {

    function setPlatformFee(uint16 _fee) external;

    function getPlatformFee() external view returns (uint16);

    function pausePlatform(address _dealContract) external;

    function unpausePlatform(address _dealContract) external;

    function isPlatformPaused() external view returns (bool);

    function disableTokenAvailability(address _tokenAddress) external returns (bool);

    function getTokenAvailability(address _tokenAddress) external view returns (bool available, uint256 amount);

    function setTokenAvailability(address _tokenAddress, uint256 _amount) external returns (bool);

}
