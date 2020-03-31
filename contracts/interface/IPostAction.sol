pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/math/SafeMath.sol";
import "../util/StablePayCommon.sol";

/**
    @title This is an abstraction to take actions after swapping the tokens.
    @author StablePay <hi@stablepay.io>

    @dev This smart contract is invoked from StablePayBase after swapping the tokens.

 */
interface IPostAction {
    using SafeMath for uint256;

    /** Events */

    /**
        @notice This event is emitted when an action is executed successfully.
        @dev The external values are used when the post-action transfers/mints/converts the target tokens into new tokens (ERC20 or Ether), so the amount may be different. So these parameters are used to track the amount and the contract associated with it.
        @dev The external parameters are associated amount/address to transfers tokens to external contracts.
            Example:
            - When the Compound post action mint the DAI tokens, the external parameters means:
                - externalAmount: the amount of cDAI tokens minted.
                - externalAddress: the cDAI token address.

        @param thisContract contract address which is emitting the event.
        @param sourceAmount amount of source address tokens.
        @param targetAmount amount of target address tokens.
        @param feeAmount platform fee for the transfer/swapping. 
        @param externalAmount amount of specific tokens which is being transferred /minted in the post action. It may not be equal to the target amount parameter.
        @param sourceToken source token address.
        @param targetToken target token address.
        @param toAddress the receiver address.
        @param externalAddress the contract address which manages the tokens defined like external amount. For example, this parameter value is the cDAI contract in the Compound post action
        @param fromAddress the sender address.
        @param actionKey a key which identifies the post action.
        @param data additional data.
     */
    event ActionExecuted(
        address indexed thisContract,
        uint256 sourceAmount,
        uint256 targetAmount,
        uint256 feeAmount,
        uint256 externalAmount,
        address sourceToken,
        address targetToken,
        address toAddress,
        address externalAddress,
        address payable fromAddress,
        bytes32 actionKey,
        bytes data
    );

    /** Functions */

    /**
        @notice It executes an action after (post-action) swapping the tokens.
        @dev Depending on the implementation, it may transfer the target tokens to other platform either minting or swapping into a new token.
        @param postActionData needed data to execute the action.
     */
    function execute(StablePayCommon.PostActionData calldata postActionData)
        external;

}
