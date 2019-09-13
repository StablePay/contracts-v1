pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "./PostActionBase.sol";
import "../../services/compound/CErc20.sol";
import "../../interface/ICompoundSettings.sol";

contract CompoundMintPostAction is PostActionBase {
    /** Constants */

    uint internal constant SUCCESS_CODE = 0;
    bytes32 internal constant COMPOUND_ACTION_DATA = "CompoundAction";
    address internal constant ADDRESS_EMPTY = address(0x0);
    
    /** Properties */
    ICompoundSettings public compoundSettings;

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address storageAddress, address aCompoundSettings) public PostActionBase(storageAddress) {
        compoundSettings = ICompoundSettings(aCompoundSettings);
    }

    /** Fallback Method */

    /** Functions */

    function execute(StablePayCommon.PostActionData memory postActionData)
        public
        isStablePay(msg.sender)
        isNotPaused()
        returns (bool)
    {
        ERC20 targetToken = ERC20(postActionData.targetToken);

        require(
            targetToken.balanceOf(address(this)) >= postActionData.toAmount,
            "Balance of ERC20 is not >= amount to transfer."
        );

        if(compoundSettings.supportErc20(postActionData.targetToken)) {
            address cTargetTokenAddress = compoundSettings.getCEr20(postActionData.targetToken);
            cTargetTokenAddress.requireNotEmpty("Target token is not supported as CErc20.");
            
            CErc20 cTargetToken = CErc20(cTargetTokenAddress);

            uint postActionInitialBalance = cTargetToken.balanceOf(address(this));

            require(targetToken.approve(cTargetTokenAddress, postActionData.toAmount), "Compound: Approve target token failed.");

            uint cTargetTokenMintResult = cTargetToken.mint(postActionData.toAmount);
            require(cTargetTokenMintResult == SUCCESS_CODE, "CErc20 mint failed.");

            uint postActionFinalBalance = cTargetToken.balanceOf(address(this));

            uint cAssetTransferredBalance = calculateAndTransferCErc20To(postActionData, cTargetToken, postActionInitialBalance, postActionFinalBalance);

            emitActionExecutedEvent(postActionData, cTargetTokenAddress, cAssetTransferredBalance);
        } else {
            require(false, "Target token is not supported in Compound.finance.");
        }
        return true;
    }

    function calculateAndTransferCErc20To(
        StablePayCommon.PostActionData memory postActionData,
        CErc20 cTargetToken,
        uint postActionInitialBalance,
        uint postActionFinalBalance
    )
        internal
        returns (uint)
    {
        uint postActionCAssetBalance = postActionFinalBalance.sub(postActionInitialBalance);
        require(
            cTargetToken.transfer(postActionData.toAddress, postActionCAssetBalance),
            "Transfer to 'to' address failed."
        );
        return postActionCAssetBalance;
    }

    function emitActionExecutedEvent(StablePayCommon.PostActionData memory postActionData, address cTargetTokenAddress, uint cAssetTransferredBalance)
        internal
        returns (bool)
    {
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
