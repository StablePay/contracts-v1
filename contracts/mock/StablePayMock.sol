pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;


import "../StablePay.sol";

/**

 */
contract StablePayMock is StablePay {

    /**** Events ***********/

    /*** Modifiers ***************/

    /*** Constructor ***************/

    constructor(address _storageAddress)
        public StablePay(_storageAddress) {
        version = 1;
    }

    /*** Methods ***************/
/*
    function _isSwappingProviderOwner(bytes32 _providerKey, address _sender)
        public
        view
        isSwappingProviderOwner(_providerKey, _sender)
        returns (bool){
            return true;
    }

    function _isSwappingProviderNewOrUpdate(bytes32 _providerKey, address _owner)
        public
        view
        isSwappingProviderNewOrUpdate(_providerKey, _owner)
        returns (bool){
            return true;
    }

    function _registerSwappingProvider(
        address _providerAddress,
        bytes32 _providerKey,
        address _owner,
        bool _pausedByOwner,
        bool _pausedByAdmin,
        bool _exists
    )
    public
    returns (bool)
    {
        providers[_providerKey] = StablePayCommon.SwappingProvider({
            providerAddress: _providerAddress,
            ownerAddress: _owner,
            pausedByOwner: _pausedByOwner,
            pausedByAdmin: _pausedByAdmin,
            exists: _exists,
            createdAt: now
        });
    }
    */
}