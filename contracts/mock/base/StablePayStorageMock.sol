pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../../base/StablePayStorage.sol";

contract StablePayStorageMock is StablePayStorage {
    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address _storageAddress)
        public
        StablePayStorage(_storageAddress)
    {
        version = 1;
    }

    /** Methods */

    function _isSwappingProviderOwner(bytes32 _providerKey, address _sender)
        public
        view
        isSwappingProviderOwner(_providerKey, _sender)
        returns (bool)
    {
        return true;
    }

    function _isSwappingProviderNewOrUpdate(
        bytes32 _providerKey,
        address _owner
    )
        public
        view
        isSwappingProviderNewOrUpdate(_providerKey, _owner)
        returns (bool)
    {
        return true;
    }

    function _registerSwappingProvider(
        address payable _providerAddress,
        bytes32 _providerKey,
        address _owner,
        bool _pausedByAdmin,
        bool _exists
    ) public returns (bool) {
        providers[_providerKey] = StablePayCommon.SwappingProvider({
            providerAddress: _providerAddress,
            ownerAddress: _owner,
            pausedByAdmin: _pausedByAdmin,
            exists: _exists,
            createdAt: now
        });
    }
}
