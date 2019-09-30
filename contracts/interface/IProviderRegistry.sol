pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
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
        @notice This event is emitted when a swapping provider is unregistered.
     */
    event SwappingProviderUnRegistered(
        address indexed thisContract,
        bytes32 providerKey,
        address swappingProvider,
        address who,
        uint256 removedAt
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
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 targetAmount
    )
        external
        view
        returns (bool isSupported, uint256 minRate, uint256 maxRate);

    function getExpectedRates(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 targetAmount
    ) external view returns (StablePayCommon.ExpectedRate[] memory);

    function getExpectedRateRange(
        IERC20 sourceToken,
        IERC20 targetToken,
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
        external;

    function unpauseByAdminSwappingProvider(bytes32 providerKey)
        external;

    function registerSwappingProvider(
        address payable providerAddress,
        bytes32 providerKey
    ) external;

    /**
        @notice It unregisters a swapping provider from the registry.
        @dev This action only can be executed by a owner.
        @param providerKey associated to the swapping provider.
        @return true if the swapping provider is unregistered. Otherwise it returns false.
     */
    function unregisterSwappingProvider(bytes32 providerKey)
        external;
}
