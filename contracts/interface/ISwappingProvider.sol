pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../util/StablePayCommon.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract ISwappingProvider {
    /** Events */

    /**
        @dev Perform the swapping between tokens.
        @dev The function must transfer the target tokens to the StablePay smart contract.
        @dev After the transfer, the StablePay contract will check the transfer result.
        @param order info to perform the swapping.
     */
    function swapToken(StablePayCommon.Order calldata order)
        external
        returns (bool);

    /**
        @dev Perform the swapping between ether and a token.
        @dev Before finishing this function must transfer the target tokens to the StablePay smart contract in order to continue with the swapping process.
        @param order info to perform the swapping. 
     */
    function swapEther(StablePayCommon.Order calldata order)
        external
        payable
        returns (bool);

    /**
        @dev Calculate the expected values (min and max) to perform the swapping.
        @dev Return whether the swapping those tokens is supported or not, and the rates. 
     */
    function getExpectedRate(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 targetAmount
    )
        external
        view
        returns (bool isSupported, uint256 minRate, uint256 maxRate);
}
