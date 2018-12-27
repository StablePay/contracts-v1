pragma solidity 0.4.25;

import "./StandardToken.sol";

// mock class using StandardToken
contract StandardTokenMock is StandardToken {

  constructor(address initialAccount, uint256 initialBalance) public {
    balances[initialAccount] = initialBalance;
    totalSupply_ = initialBalance;
  }

  function addBalance( address _to, uint256 _value) public returns (bool) {
    require(_to != address(0));

    balances[_to] = balances[_to].add(_value);
    allowed[_to][msg.sender] = balances[_to];
    emit Transfer(_to, _to, _value);
    return true;
  }

}
