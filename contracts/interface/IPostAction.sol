pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../util/StablePayCommon.sol";
import "../util/SafeMath.sol";

interface IPostAction {
    using SafeMath for uint256;

    /** Events */

    event ActionExecuted(
        address thisContract,
        bytes32 data
    );
    
    /** Functions */

    function execute(StablePayCommon.Order calldata order, uint feeAmount) external returns (bool);

}
