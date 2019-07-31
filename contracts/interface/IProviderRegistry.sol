pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../services/erc20/ERC20.sol";
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

    /**
        @dev This event is emitted when a specific swapping provider is unpaused.
     */
    event SwappingProviderUnpaused(
        address indexed thisContract,
        address indexed providerAddress
    );

    /** Functions */

    function getExpectedRate(
        bytes32 providerKey,
        ERC20 sourceToken,
        ERC20 targetToken,
        uint256 targetAmount
    )
        external
        view
        returns (bool isSupported, uint256 minRate, uint256 maxRate);

    function getExpectedRates(
        ERC20 sourceToken,
        ERC20 targetToken,
        uint256 targetAmount
    ) external view returns (StablePayCommon.ExpectedRate[] memory);

    function getExpectedRateRange(
        ERC20 sourceToken,
        ERC20 targetToken,
        uint256 targetAmount
    ) external view returns (uint256 minRate, uint256 maxRate);

    function getSwappingProvider(bytes32 providerKey)
        external
        view
        returns (StablePayCommon.SwappingProvider memory);

    function isSwappingProviderPaused(bytes32 providerKey)
        external
        view
        returns (bool);

    function isSwappingProviderValid(bytes32 providerKey)
        external
        view
        returns (bool);

    function getProvidersRegistryCount() external view returns (uint256);

    function pauseByAdminSwappingProvider(bytes32 providerKey)
        external
        returns (bool);

    function unpauseByAdminSwappingProvider(bytes32 providerKey)
        external
        returns (bool);

    function pauseSwappingProvider(bytes32 providerKey) external returns (bool);

    function unpauseSwappingProvider(bytes32 providerKey)
        external
        returns (bool);

    function registerSwappingProvider(
        address payable providerAddress,
        bytes32 providerKey
    ) external returns (bool);
}
