pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../util/StablePayCommon.sol";
import "../util/SafeMath.sol";

interface IPostAction {
    using SafeMath for uint256;

    /** Events */

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

    function execute(StablePayCommon.PostActionData calldata postActionData) external returns (bool);

}
