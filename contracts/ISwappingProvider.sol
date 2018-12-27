pragma solidity 0.4.25;
// TODO Is it required in a abstract contract?
pragma experimental ABIEncoderV2;

import "./StablePayCommon.sol";

contract ISwappingProvider {

    function payToken(StablePayCommon.Order order) public returns (bool);

    function payEther(StablePayCommon.Order order) public payable returns (bool);
}