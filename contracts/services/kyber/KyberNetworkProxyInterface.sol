pragma solidity 0.5.3;

import "../erc20/ERC20.sol";

/// @title Kyber Network interface
interface KyberNetworkProxyInterface {
    function maxGasPrice() external view returns (uint256);
    function getUserCapInWei(address user) external view returns (uint256);
    function getUserCapInTokenWei(address user, ERC20 token)
        external
        view
        returns (uint256);
    function enabled() external view returns (bool);
    function info(bytes32 id) external view returns (uint256);
    function getExpectedRate(ERC20 src, ERC20 dest, uint256 srcQty)
        external
        view
        returns (uint256 expectedRate, uint256 slippageRate);
    function tradeWithHint(
        ERC20 src,
        uint256 srcAmount,
        ERC20 dest,
        address destAddress,
        uint256 maxDestAmount,
        uint256 minConversionRate,
        address walletId,
        bytes calldata hint
    ) external payable returns (uint256);
    function trade(
        ERC20 src,
        uint256 srcAmount,
        ERC20 dest,
        address destAddress,
        uint256 maxDestAmount,
        uint256 minConversionRate,
        address walletId
    ) external payable returns (uint256);
}
