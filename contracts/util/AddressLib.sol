pragma solidity 0.5.10;

/**
 * Utility library of inline functions on addresses
 */
library AddressLib {
    address internal constant ADDRESS_EMPTY = address(0x0);

    /**
     * Returns whether the target address is a contract
     * @dev This function will return false if invoked during the constructor of a contract,
     * as the code is not actually created until after the constructor finishes.
     * @param account address of the account to check
     * @return whether the target address is a contract
     */
    function isContract(address account) internal view returns (bool) {
        uint256 size;
        // Note: Currently there is no better way to check if there is a contract in an address
        // than to check the size of the code at that address.
        // See https://ethereum.stackexchange.com/a/14016/36603
        // for more details about how this works.
        // Note: Check this again before the Serenity release, because all addresses will be
        // contracts then.
        // solhint-disable-next-line no-inline-assembly
        assembly {
            size := extcodesize(account)
        }
        return size > 0;
    }

    function isEmpty(address self) internal pure returns (bool) {
        return self == ADDRESS_EMPTY;
    }

    function equalTo(address self, address other) internal pure returns (bool) {
        return self == other;
    }

    function notEqualTo(address self, address other)
        internal
        pure
        returns (bool)
    {
        return self != other;
    }

    function isNotEmpty(address self) internal pure returns (bool) {
        return self != ADDRESS_EMPTY;
    }

    function requireNotEmpty(address self, string memory message)
        internal
        pure
    {
        require(isNotEmpty(self), message);
    }

    function requireEmpty(address self, string memory message)
        internal
        pure
    {
        require(isEmpty(self), message);
    }

    function requireEqualTo(address self, address other, string memory message)
        internal
        pure
    {
        require(equalTo(self, other), message);
    }

    function requireNotEqualTo(
        address self,
        address other,
        string memory message
    ) internal pure {
        require(notEqualTo(self, other), message);
    }
}
