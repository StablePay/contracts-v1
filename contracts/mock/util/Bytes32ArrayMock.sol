pragma solidity 0.5.10;

import "../../util/Bytes32ArrayLib.sol";

/**
  @author StablePay <hi@stablepay.io>
 */
contract Bytes32ArrayMock {
  using Bytes32ArrayLib for bytes32[];

  bytes32[] public data;

  constructor(bytes32[] memory initialData) public {
    data = initialData;
  }

  function getData()
    public
    view
    returns (bytes32[] memory)
  {
    return data;
  }
  
  function add(bytes32 newItem)
    public
    returns (bytes32[] memory)
  {
      data = data.add(newItem);
  }

  function removeAt(uint256 index)
    public
    returns (bytes32[] memory)
  {
      data = data.removeAt(index);
  }

  function getIndex(bytes32 item)
    public
    view
    returns (bool found, uint indexAt)
  {
      return data.getIndex(item);
  }

  function remove(bytes32 item)
    public
    returns (bytes32[] memory)
  {
      data = data.remove(item);
  }
}
