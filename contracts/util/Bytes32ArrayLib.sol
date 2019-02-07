pragma solidity 0.4.25;

library Bytes32ArrayLib {

  function add(bytes32[] storage self, bytes32 newItem) internal returns (bytes32[]) {
    require(newItem != 0x0);
    self.push(newItem);
    return self;
  }
}
