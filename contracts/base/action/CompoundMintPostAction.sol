pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "./PostActionBase.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "../../services/compound/CErc20.sol";
import "../../interface/ICompoundSettings.sol";

/**
    @title It is a Post Action implementation to support Compound.finance integration.
    @notice This post action mints the target token in a specific Compound finance token (cToken) (see details https://compound.finance/developers/ctokens).
    @notice After minting the target token, this post action transfers the cToken amount to the receiver adress.
    @author StablePay <hi@stablepay.io>
 */
contract CompoundMintPostAction is PostActionBase {
    /** Constants */

    /**
        @notice It is used as a success result after minting the tokens.
     */
    uint256 internal constant SUCCESS_CODE = 0;
    bytes32 internal constant COMPOUND_ACTION_DATA = "CompoundAction";
    address internal constant ADDRESS_EMPTY = address(0x0);

    /** Properties */
    ICompoundSettings public compoundSettings;

    /** Events */

    /** Modifiers */

    /** Constructor */

    /**
        @notice It creates a new CompoundMintPostAction instance associated to an Eternal Storage implementation, and a Compound settings contract instance.
        @param storageAddress the Eternal Storage implementation.
        @param aCompoundSettings contract address which contains the platform configuration for the Compound.finance platform.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress, address aCompoundSettings)
        public
        PostActionBase(storageAddress)
    {
        compoundSettings = ICompoundSettings(aCompoundSettings);
    }

    /** Fallback Method */

    /** Functions */

    /**
        @notice It mints the target tokens in Compound.finance, and transfer the tokens to the owner.
        @param postActionData needed data to execute the action.
        @return true if the action is executed successfully. Otherwise it returns false.
     */
    function execute(StablePayCommon.PostActionData memory postActionData)
        public
        isStablePay(msg.sender)
        isNotPaused()
    {
        IERC20 targetToken = IERC20(postActionData.targetToken);

        require(
            targetToken.balanceOf(address(this)) >= postActionData.toAmount,
            "Balance of ERC20 is not gte amount to transfer."
        );

        if (compoundSettings.supportErc20(postActionData.targetToken)) {
            address cTargetTokenAddress = compoundSettings.getCEr20(
                postActionData.targetToken
            );
            cTargetTokenAddress.requireNotEmpty(
                "Target token is not supported as CErc20."
            );

            CErc20 cTargetToken = CErc20(cTargetTokenAddress);

            uint256 postActionInitialBalance = cTargetToken.balanceOf(address(this));

            require(
                targetToken.approve(cTargetTokenAddress, postActionData.toAmount),
                "Compound: Approve target token failed."
            );

            uint256 cTargetTokenMintResult = cTargetToken.mint(postActionData.toAmount);
            require(cTargetTokenMintResult == SUCCESS_CODE, "CErc20 mint failed.");

            uint256 postActionFinalBalance = cTargetToken.balanceOf(address(this));

            uint256 cAssetTransferredBalance = calculateAndTransferCErc20To(
                postActionData,
                cTargetToken,
                postActionInitialBalance,
                postActionFinalBalance
            );

            emitActionExecutedEvent(
                postActionData,
                cTargetTokenAddress,
                cAssetTransferredBalance
            );
        } else {
            revert("Target token is not supported in Compound.finance.");
        }
    }

    /**
        @notice It calculates and transfer the cToken amount based on the initial and final balance.
        @param postActionData associated to this execution.
        @param cTargetToken cToken address (Compound token).
        @param postActionInitialBalance this contract initial cTargetToken balance.
        @param postActionFinalBalance this contract final cTargetToken balance.
        @return the current cToken balance for the execution (final balance - initial balance).
     */
    function calculateAndTransferCErc20To(
        StablePayCommon.PostActionData memory postActionData,
        CErc20 cTargetToken,
        uint256 postActionInitialBalance,
        uint256 postActionFinalBalance
    ) internal returns (uint256) {
        uint256 postActionCAssetBalance = postActionFinalBalance.sub(
            postActionInitialBalance
        );
        require(
            cTargetToken.transfer(postActionData.toAddress, postActionCAssetBalance),
            "Transfer to 'to' address failed."
        );
        return postActionCAssetBalance;
    }

    /**
        @notice It emits an ActionExecuted event associated to the post action data, token address, and amount.
        @param postActionData associated to this execution.
        @param cTargetTokenAddress target token address used in Compound.finance platform.
        @param cAssetTransferredBalance target amount minted in Compound.finance.
     */
    function emitActionExecutedEvent(
        StablePayCommon.PostActionData memory postActionData,
        address cTargetTokenAddress,
        uint256 cAssetTransferredBalance
    ) internal {
        emit ActionExecuted(
            address(this),
            postActionData.sourceAmount,
            postActionData.toAmount,
            postActionData.feeAmount,
            cAssetTransferredBalance,
            postActionData.sourceToken,
            postActionData.targetToken,
            postActionData.toAddress,
            cTargetTokenAddress,
            postActionData.fromAddress,
            COMPOUND_ACTION_DATA,
            postActionData.data
        );
    }
}
