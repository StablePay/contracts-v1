pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "./PostActionBase.sol";
import "../../services/token/WETH9.sol";

/**
    @title It is a Post Action implementation to support Ether as a target asset.
    @notice This post action receives a specific Wrapped ETH (WETH) token amount, and transfer the same amount to the receiver as Ether.
    @author StablePay <hi@stablepay.io>
 */
contract EtherTransferPostAction is PostActionBase {

    /** Constants */

    address internal constant ADDRESS_EMPTY = address(0x0);
    bytes32 internal constant ETHER_TRANSFER_ACTION_DATA = "EtherTransferAction";

    /** Properties */
    address public wethTokenAddress;

    /** Events */

    /** Modifiers */

    /** Constructor */

    /**
        @notice It creates a new EtherTransferPostAction instance associated to an Eternal Storage implementation, and the WETH token address.
        @param storageAddress the Eternal Storage implementation.
        @param aWethTokenAddress WETH token address which contains functions to withdraw/deposit Ether/WETH.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress, address aWethTokenAddress)
        public
        PostActionBase(storageAddress)
    {
        wethTokenAddress = aWethTokenAddress;
    }

    /** Fallback Method */

    /** Functions */

    /**
        @notice It withdraws the WETH tokens (the WETH contract transfers the same amount in Ether to this contract), and it transfers the Ether to the receiver address.
        @param postActionData needed data to execute the action.
        @return true if the action is executed successfully. Otherwise it returns false.
     */
    function execute(StablePayCommon.PostActionData memory postActionData)
        public
        nonReentrant()
        isStablePay(msg.sender)
        isNotPaused()
        returns (bool)
    {
        // Verifies WETH token address.
        wethTokenAddress.requireEqualTo(postActionData.targetToken, "WETH token address is not eq target token adress.");
        require(
            WETH9(postActionData.targetToken).balanceOf(address(this)) >= postActionData.toAmount,
            "Balance of WETH9 is not gte amount to transfer."
        );

        // Gets the initial Ether balance.
        uint256 initialPostActionEtherBalance = address(this).balance;

        // Withdraws the amount. After the execution this contract will get the same amount in Ether.
        WETH9(postActionData.targetToken).withdraw(postActionData.toAmount);

        // Gets the final Ether balance.
        uint256 finalPostActionEtherBalance = address(this).balance;

        // Calculate the Ether amount and transfer it to the receiver address.
        uint256 etherAmountToTransfer = calculateEtherAndTransfer(
            postActionData,
            initialPostActionEtherBalance,
            finalPostActionEtherBalance
        );

        // Emit ActionExecuted event.
        emitActionExecutedEvent(postActionData, etherAmountToTransfer);

        return true;
    }

    /**
        @notice It emits an ActionExecuted event associated to the post action data, token address, and amount.
        @param postActionData associated to this execution.
        @param etherAmountTransferred ether amount transferred to the receiver address.
     */
    function emitActionExecutedEvent(StablePayCommon.PostActionData memory postActionData, uint etherAmountTransferred)
        internal
    {
        emit ActionExecuted(
            address(this),
            postActionData.sourceAmount,
            postActionData.toAmount,
            postActionData.feeAmount,
            etherAmountTransferred, // External amount
            postActionData.sourceToken,
            postActionData.targetToken,
            postActionData.toAddress,
            wethTokenAddress,       // External address
            postActionData.fromAddress,
            ETHER_TRANSFER_ACTION_DATA,
            postActionData.data
        );
    }

    /**
        @notice It calculates the ether amount and transfer it to the receiver address.
        @param postActionData associated to this execution.
        @param initialPostActionEtherBalance ether amount before widthdrawing the WETH tokens.
        @param finalPostActionEtherBalance ether amount after widthdrawing the WETH tokens.
     */
    function calculateEtherAndTransfer(
        StablePayCommon.PostActionData memory postActionData,
        uint256 initialPostActionEtherBalance,
        uint256 finalPostActionEtherBalance
    )
        internal
        returns (uint256)
    {
        uint256 etherAmountToTransfer = finalPostActionEtherBalance.sub(initialPostActionEtherBalance);
        require(etherAmountToTransfer > 0, "Ether amount must be gt 0.");
        require(postActionData.toAmount == etherAmountToTransfer, "To amount is not eq ether amount received.");

        // Transfer Ether to the received address. See https://diligence.consensys.net/posts/2019/09/stop-using-soliditys-transfer-now/
        (bool success, ) = postActionData.toAddress.call.value(etherAmountToTransfer)("");
        require(success, "Ether transfer to receiver failed.");

        return etherAmountToTransfer;
    }
}
