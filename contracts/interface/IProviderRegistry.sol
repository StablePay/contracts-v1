pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../erc20/ERC20.sol";
import "../util/StablePayCommon.sol";

interface IProviderRegistry {
    
    /** Events */

    /**
        @dev This event is emitted when a new swapping provider is registered.
     */
    event NewSwappingProviderRegistered(
        address indexed thisContract,
        bytes32 providerKey,
        address swappingProvider,
        address owner,
        uint256 createdAt
    );

    /**
        @dev This event is emitted when a specific swapping provider is paused.
     */
    event SwappingProviderPaused(
        address indexed thisContract,
        address indexed providerAddress
    );

    event SwappingProviderUnpaused(
        address indexed thisContract,
        address indexed providerAddress
    );

    /*** Methods ***************/

    // TODO Modify to getExpectedAmount ?
    function getExpectedRate(bytes32 _providerKey, ERC20 _src, ERC20 _dest, uint _srcQty)
        external
        view
        returns (uint, uint);

    function getExpectedRates(ERC20 _src, ERC20 _dest, uint _srcQty)
        external
        view
        returns (StablePayCommon.ExpectedRate[]);

    function getExpectedRateRange(ERC20 _src, ERC20 _dest, uint _srcQty)
        external
        view
        returns (uint minRate, uint maxRate);

    function getSwappingProvider(bytes32 _providerKey)
        external
        view
        returns (StablePayCommon.SwappingProvider);

    function isSwappingProviderPaused(bytes32 _providerKey)
        external
        view
        returns (bool);

    function isSwappingProviderValid(bytes32 _providerKey)
        external
        view
        returns (bool);

    function getProvidersRegistryCount()
        external
        view
        returns (uint256);

    function pauseByAdminSwappingProvider(bytes32 _providerKey)
        external
        returns (bool);

    function unpauseByAdminSwappingProvider(bytes32 _providerKey)
        external
        returns (bool);

    function pauseSwappingProvider(bytes32 _providerKey)
        external
        returns (bool);

    function unpauseSwappingProvider(bytes32 _providerKey)
        external
        returns (bool);

    function registerSwappingProvider(
        address _providerAddress,
        bytes32 _providerKey
    )
    external
    returns (bool);
}