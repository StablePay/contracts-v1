pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
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
     */
    event ActionExecuted(
        address indexed thisContract,
        uint256 sourceAmount,
        uint256 targetAmount,
        uint256 feeAmount,
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
        @notice It executes an action
        @param postActionData needed data to execute the action.
        @return true if the action is executed successfully. Otherwise it returns false.
     */
    function execute(StablePayCommon.PostActionData calldata postActionData)
        external
        returns (bool);

}
