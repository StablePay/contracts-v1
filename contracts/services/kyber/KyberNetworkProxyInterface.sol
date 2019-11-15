pragma solidity 0.5.10;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/// @title Kyber Network interface
interface KyberNetworkProxyInterface {
    function maxGasPrice() external view returns (uint256);
    function getUserCapInWei(address user) external view returns (uint256);
    function getUserCapInTokenWei(address user, IERC20 token)
        external
        view
        returns (uint256);
    function enabled() external view returns (bool);
    function info(bytes32 id) external view returns (uint256);
    function getExpectedRate(IERC20 src, IERC20 dest, uint256 srcQty)
        external
        view
        returns (uint256 expectedRate, uint256 slippageRate);
    function tradeWithHint(
        IERC20 src,
        uint256 srcAmount,
        IERC20 dest,
        address destAddress,
        uint256 maxDestAmount,
        uint256 minConversionRate,
        address walletId,
        bytes calldata hint
    ) external payable returns (uint256);
    function trade(
        IERC20 src,
        uint256 srcAmount,
        IERC20 dest,
        address destAddress,
        uint256 maxDestAmount,
        uint256 minConversionRate,
        address walletId
    ) external payable returns (uint256);
}
