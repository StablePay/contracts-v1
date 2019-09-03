pragma solidity 0.5.10;

import "./IsContract.sol";
import "./ERCAbstractProxy.sol";

/**
    @title It delegates a call function to a destination address.
    @dev Borrowed from the Awesome AragonOS project.
 */
contract DelegateProxy is ERCAbstractProxy, IsContract {
    //uint256 internal constant FWD_GAS_LIMIT = 10000;

    /**
    * @dev Performs a delegatecall and returns whatever the delegatecall returned (entire context execution will return!)
    * @param destination Destination address to perform the delegatecall
    * @param callData Calldata for the delegatecall
    */
    function delegatedFwd(address destination, bytes memory callData) internal {
        require(
            isContract(destination),
            "Destination address is not a contract."
        );
        //uint256 fwdGasLimit = FWD_GAS_LIMIT;

        assembly {
            let result := delegatecall(
                gas,
                destination,
                add(callData, 0x20),
                mload(callData),
                0,
                0
            )
            let size := returndatasize
            let ptr := mload(0x40)
            returndatacopy(ptr, 0, size)

            // revert instead of invalid() bc if the underlying call failed with invalid() it already wasted gas.
            // if the call returned error data, forward it
            switch result
                case 0 {
                    revert(ptr, size)
                }
                default {
                    return(ptr, size)
                }
        }
    }

    /**
  * @dev Fallback function allowing to perform a delegatecall to the given implementation.
  * This function will return whatever the implementation call returns
  * /
  function () payable public {
    address _impl = implementation();
    require(_impl != address(0));

    assembly {
      let ptr := mload(0x40)
      calldatacopy(ptr, 0, calldatasize)
      let result := delegatecall(gas, _impl, ptr, calldatasize, 0, 0)
      let size := returndatasize
      returndatacopy(ptr, 0, size)

      switch result
      case 0 { revert(ptr, size) }
      default { return(ptr, size) }
    }
  }*/
}
