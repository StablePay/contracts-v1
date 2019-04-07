pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../erc20/ERC20.sol";
import "../providers/ISwappingProvider.sol";

contract SwappingProviderMock is ISwappingProvider {

  /** Fields */
  bool public isSupported;
  uint public minRate;
  uint public maxRate;

  address public sourceToken;
  address public targetToken;

  uint public plusSourceAmount = 0;
  uint public plusTargetAmount = 0;

  /** Constructor */

  constructor(address stablePay)
  public ISwappingProvider(stablePay){}

  /** Functions */

  function setPlusAmounts(uint _plusSourceAmount, uint _plusTargetAmount)
  public
  returns (bool)
  {
    plusSourceAmount = _plusSourceAmount;
    plusTargetAmount = _plusTargetAmount;
    return true;
  }

  function setTokens(address _sourceToken, address _targetToken)
  public
  returns (bool)
  {
    sourceToken = _sourceToken;
    targetToken = _targetToken;
    return true;
  }

  function setRates(bool _isSupported, uint _minRate, uint _maxRate)
  public
  returns (bool)
  {
    isSupported = _isSupported;
    minRate = _minRate;
    maxRate = _maxRate;
    return true;
  }

  function swapToken(StablePayCommon.Order _order)
  public
  returns (bool)
  {
      //uint sourceAmount = _order.sourceAmount + plusSourceAmount;
      //bool targetTransferResult = ERC20(_order.sourceToken).transfer(msg.sender, sourceAmount);
      //require(targetTransferResult, "Target token transfer not valid.");
      
      //uint targetAmount = _order.targetAmount + plusTargetAmount;
      bool targetTransferResult = ERC20(_order.targetToken).transfer(msg.sender, _order.targetAmount);
      require(targetTransferResult, "Target token transfer not valid.");

      return true;
  }

  function swapEther(StablePayCommon.Order order)
  public
  payable
  returns (bool) {
    order;
    return true;
  }

  function getExpectedRate(ERC20 src, ERC20 dest, uint srcQty)
  public
  view
  returns (bool _isSupported, uint _minRate, uint _maxRate) {
    src; dest; srcQty;
    return (isSupported, minRate, maxRate);
  }

}
