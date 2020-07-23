pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../util/StablePayCommon.sol";

/**
    @notice This is the entry point to interact with the StablePay platform.
    @dev It defines the functions to swap and transfer any token (ERC20) or Ether into any pre-configured token (ERC20).
    @dev As StablePay doesn't use its own liquidity to swap tokens/ether, StablePay supports swap any token if at least one registered swapping provider supports it.

    @author StablePay <hi@stablepay.io>
 */
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
    event DepositReceived(address indexed thisContract, address from, uint256 amount);

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

    /**
        @notice It transfers (and swaps if needed) a specific amount of tokens (defined in the order) to a specific receiver.
        @dev If the source and target tokens are the same, StablePay only transfers the amount of tokens defined in the order.
        @dev Otherwise, StablePay uses each swapping provider ordered in the keys provided as input.
        @dev The provider keys list must be not empty in order to swap the tokens.

        @param order order instance which defines the data needed to make the transfer and swap if needed.
        @param providerKey provider key to be used as liquidity providers in the swapping process.
     */
    function transferWithTokens(StablePayCommon.Order memory order, bytes32 providerKey)
        public;

    /**
        @notice It swaps and transfers a specific amount of ether (defined in the order and msg.value parameter) to a specific amount of tokens and finally transfers it to a receiver address.
        @dev StablePay uses each swapping provider ordered in the keys provided as input to attempt the swapping/exchange ether/tokens.
        @dev The provider keys list must be not empty in order to swap the tokens.

        @param order order instance which defines the data needed to make the swap (ether to token) and transfer.
        @param providerKey provider key to be used as liquidity providers in the swapping process.
     */
    function transferWithEthers(StablePayCommon.Order memory order, bytes32 providerKey)
        public
        payable;
}
