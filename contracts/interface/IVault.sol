pragma solidity 0.4.25;

contract IVault {

    function deposit() payable external returns (bool);

    function transferTokens(address _tokenAddress, address _toAddress, uint256 _amount) external returns (bool);

    function transferEthers(address _toAddress, uint256 _amount) external returns (bool);
}