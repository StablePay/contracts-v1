pragma solidity 0.4.25;

interface ISettings {

    function setPlatformFee(uint16 _fee) external;

    function pausePlatform(address _dealContract) external;

    function unpausePlatform(address _dealContract) external;

    function isPlatformPaused() external view returns (bool);

}
