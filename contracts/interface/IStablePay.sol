pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../util/StablePayCommon.sol";

contract IStablePay {

    /** Events */

    /**
        @dev This event is emitted when a swap execution has failed.
     */
    event SwapExecutionFailed(
        address indexed thisContract,
        address indexed providerAddress,
        bytes32 providerKey
    );

    /**
        @dev This event is emitted when a swap has been executed successfully.
     */
    event SwapExecutionSuccess(
        address indexed thisContract,
        address indexed providerAddress,
        bytes32 providerKey
    );

    /**
        @dev This event is emitted when a swap ETH has been executed successfully.
     */
    event SwapEthExecutionFailed(
        address indexed thisContract,
        address indexed strategyAddress,
        bytes32 providerKey
    );

    /**
        @dev This event is emitted when a swap ETH has been executed successfully.
     */
    event SwapEthExecutionSuccess(
        address indexed thisContract,
        address indexed strategyAddress,
        bytes32 providerKey
    );

    /** Functions */

    function payWithToken(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    returns (bool);

    function payWithEther(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    payable
    returns (bool);
}