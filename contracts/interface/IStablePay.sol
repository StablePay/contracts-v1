pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../util/StablePayCommon.sol";

contract IStablePay {
    /** Events */

    /**
        @dev This event is emitted when a swap execution has failed.
     */
    event ExecutionTransferFailed(
        address indexed thisContract,
        address indexed providerAddress,
        address sourceToken,
        address targetToken,
        address from,
        address to,
        uint256 timestamp,
        bytes32 providerKey,
        bytes data
    );

    /**
        @dev This event is emitted when a swap has been executed successfully.
     */
    event ExecutionTransferSuccess(
        bytes32 indexed providerKey,
        address sourceToken,
        address targetToken,
        address from,
        address to,
        uint256 fromAmount,
        uint256 toAmount,
        uint256 feeAmount,
        uint16 platformFee,
        bytes data
    );

    /**
        @dev This event is emitted when a deposit is received.
     */
    event DepositReceived(
        address indexed thisContract,
        address from,
        uint256 amount
    );

    /**
        @dev This event is emitted when a new payment is sent to an address.
     */
    event PaymentSent(
        address indexed thisContract,
        address to,
        address from,
        address sourceToken,
        address targetToken,
        uint256 amount
    );

    /** Functions */

    function transferWithTokens(
        StablePayCommon.Order memory order,
        bytes32[] memory providerKeys
    ) public returns (bool);

    function transferWithEthers(
        StablePayCommon.Order memory order,
        bytes32[] memory providerKeys
    ) public payable returns (bool);

    function emitPaymentSentEvent(
        StablePayCommon.Order memory order,
        uint256 amountSent
    ) internal {
        emit PaymentSent(
            address(this),
            order.toAddress,
            msg.sender,
            order.sourceToken,
            order.targetToken,
            amountSent
        );
    }
}
