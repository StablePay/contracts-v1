pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "openzeppelin-solidity/contracts/math/SafeMath.sol";
import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "../base/Base.sol";
import "../util/Bytes32ArrayLib.sol";
import "../util/StablePayCommon.sol";
import "../interface/ISwappingProvider.sol";
import "../interface/IProviderRegistry.sol";

contract StablePayStorage is Base, IProviderRegistry {
    using SafeMath for uint256;
    using Bytes32ArrayLib for bytes32[];

    /** Properties */

    /**
        @dev This mapping is used to store providers to swap tokens.
     */
    mapping(bytes32 => StablePayCommon.SwappingProvider) public providers;

    /**
        @dev This registry is used to know all the providers created in StablePay.
     */
    bytes32[] public providersRegistry;

    /** Modifiers */

    modifier swappingProviderExists(bytes32 providerKey) {
        require(
            providers[providerKey].exists == true,
            "Swapping provider must exist."
        );
        _;
    }

    modifier isSwappingProviderOwner(bytes32 providerKey, address owner) {
        require(
            providers[providerKey].ownerAddress == owner,
            "Swapping provider owner is not valid."
        );
        _;
    }

    modifier isSwappingProviderPausedByOwner(bytes32 providerKey) {
        require(
            providers[providerKey].pausedByOwner == true,
            "Swapping provider must be paused."
        );
        _;
    }

    modifier isSwappingProviderPausedByAdmin(bytes32 providerKey) {
        require(
            providers[providerKey].pausedByAdmin == true,
            "Swapping provider must be paused."
        );
        _;
    }

    modifier isSwappingProviderNotPausedByAdmin(bytes32 providerKey) {
        require(
            providers[providerKey].pausedByAdmin == false,
            "Swapping provider must not be paused by admin."
        );
        _;
    }

    modifier isSwappingProviderNewOrUpdate(bytes32 providerKey, address owner) {
        StablePayCommon.SwappingProvider storage swappingProvider = providers[providerKey];

        bool isNewOrUpdate = (
                swappingProvider.exists &&
                    swappingProvider.ownerAddress == owner
            ) ||
            (!swappingProvider.exists);
        require(
            isNewOrUpdate,
            "Swapping provider must be new or an update by owner."
        );
        _;
    }

    /** Constructor */

    constructor(address storageAddress) public Base(storageAddress) {}

    /** Fallback Method */
    // TODO Review fallback function.

    function() external payable {
        require(msg.value > 0, "Msg value > 0");
        emit DepositReceived(address(this), msg.sender, msg.value);
    }

    /** Functions */

    function getExpectedRate(
        bytes32 providerKey,
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 targetAmount
    ) external view returns (bool isSupported, uint256 minRate, uint256 maxRate) {
        require(
            isSwappingProviderValidInternal(providerKey),
            "Provider must exist and be enabled."
        );
        StablePayCommon.SwappingProvider memory swappingProvider = providers[providerKey];
        ISwappingProvider iSwappingProvider = ISwappingProvider(
            swappingProvider.providerAddress
        );
        return
            iSwappingProvider.getExpectedRate(
                sourceToken,
                targetToken,
                targetAmount
            );
    }

    function getSupportedExpectedRatesCount(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 targetAmount
    ) internal view returns (uint256) {
        uint256 count = 0;
        for (
            uint256 index = 0;
            index < providersRegistry.length;
            index = index.add(1)
        ) {
            bytes32 _providerKey = providersRegistry[index];
            if (isSwappingProviderValidInternal(_providerKey)) {
                ISwappingProvider iSwappingProvider = ISwappingProvider(
                    providers[_providerKey].providerAddress
                );
                bool isSupported;
                (isSupported, , ) = iSwappingProvider.getExpectedRate(
                    sourceToken,
                    targetToken,
                    targetAmount
                );
                if (isSupported) {
                    count = count.add(1);
                }
            }
        }
        return count;
    }

    function getExpectedRates(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 targetAmount
    )
        external
        view
        returns (StablePayCommon.ExpectedRate[] memory expectedRates)
    {
        expectedRates = new StablePayCommon.ExpectedRate[](
            getSupportedExpectedRatesCount(
                sourceToken,
                targetToken,
                targetAmount
            )
        );
        uint256 currentIndex = 0;
        for (
            uint256 index = 0;
            index < providersRegistry.length;
            index = index.add(1)
        ) {
            bytes32 _providerKey = providersRegistry[index];
            if (isSwappingProviderValidInternal(_providerKey)) {
                StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];
                ISwappingProvider iSwappingProvider = ISwappingProvider(
                    swappingProvider.providerAddress
                );
                uint256 minRate;
                uint256 maxRate;
                bool isSupported;
                (isSupported, minRate, maxRate) = iSwappingProvider
                    .getExpectedRate(sourceToken, targetToken, targetAmount);
                if (isSupported) {
                    expectedRates[currentIndex] = StablePayCommon.ExpectedRate({
                        providerKey: _providerKey,
                        minRate: minRate,
                        maxRate: maxRate,
                        isSupported: isSupported
                    });
                    currentIndex = currentIndex.add(1);
                }
            }
        }
        return expectedRates;
    }

    function getExpectedRateRange(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 targetAmount
    ) external view returns (uint256 minRate, uint256 maxRate) {
        uint256 minRateResult = 0;
        uint256 maxRateResult = 0;

        for (
            uint256 index = 0;
            index < providersRegistry.length;
            index = index.add(1)
        ) {
            bytes32 _providerKey = providersRegistry[index];
            if (isSwappingProviderValidInternal(_providerKey)) {
                StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];
                ISwappingProvider iSwappingProvider = ISwappingProvider(
                    swappingProvider.providerAddress
                );
                uint256 minRateProvider;
                uint256 maxRateProvider;
                bool isSupported;
                (
                    isSupported,
                    minRateProvider,
                    maxRateProvider
                ) = iSwappingProvider.getExpectedRate(
                    sourceToken,
                    targetToken,
                    targetAmount
                );

                if (isSupported) {
                    if (minRateResult == 0 || minRateProvider < minRateResult) {
                        minRateResult = minRateProvider;
                    }
                    if (maxRateResult == 0 || maxRateProvider > maxRateResult) {
                        maxRateResult = maxRateProvider;
                    }
                }
            }
        }
        return (minRateResult, maxRateResult);
    }

    function getSwappingProvider(bytes32 providerKey)
        external
        view
        returns (StablePayCommon.SwappingProvider memory)
    {
        return providers[providerKey];
    }

    function isSwappingProviderPaused(bytes32 providerKey)
        external
        view
        returns (bool)
    {
        return
            providers[providerKey].exists &&
                (
                    providers[providerKey].pausedByOwner ||
                        providers[providerKey].pausedByAdmin
                );
    }

    function isSwappingProviderValidInternal(bytes32 providerKey)
        internal
        view
        returns (bool)
    {
        return
            providers[providerKey].exists &&
                !providers[providerKey].pausedByOwner &&
                !providers[providerKey].pausedByAdmin;
    }

    function isSwappingProviderValid(bytes32 providerKey)
        external
        view
        returns (bool)
    {
        return isSwappingProviderValidInternal(providerKey);
    }

    function getProvidersRegistryCount() external view returns (uint256) {
        return providersRegistry.length;
    }

    function pauseByAdminSwappingProvider(bytes32 _providerKey)
        external
        swappingProviderExists(_providerKey)
        isSwappingProviderNotPausedByAdmin(_providerKey)
        onlySuperUser()
        returns (bool)
    {
        providers[_providerKey].pausedByAdmin = true;

        emit SwappingProviderPaused(
            address(this),
            providers[_providerKey].providerAddress
        );
        return true;
    }

    function unpauseByAdminSwappingProvider(bytes32 _providerKey)
        external
        swappingProviderExists(_providerKey)
        isSwappingProviderPausedByAdmin(_providerKey)
        onlySuperUser()
        returns (bool)
    {
        providers[_providerKey].pausedByAdmin = false;

        emit SwappingProviderUnpaused(
            address(this),
            providers[_providerKey].providerAddress
        );
        return true;
    }

    function pauseSwappingProvider(bytes32 _providerKey)
        external
        swappingProviderExists(_providerKey)
        isSwappingProviderOwner(_providerKey, msg.sender)
        isSwappingProviderNotPausedByAdmin(_providerKey)
        onlySuperUser()
        returns (bool)
    {
        providers[_providerKey].pausedByOwner = true;

        emit SwappingProviderPaused(
            address(this),
            providers[_providerKey].providerAddress
        );
        return true;
    }

    function unpauseSwappingProvider(bytes32 _providerKey)
        external
        swappingProviderExists(_providerKey)
        isSwappingProviderOwner(_providerKey, msg.sender)
        isSwappingProviderPausedByOwner(_providerKey)
        isSwappingProviderNotPausedByAdmin(_providerKey)
        onlySuperUser()
        returns (bool)
    {
        providers[_providerKey].pausedByOwner = false;

        emit SwappingProviderUnpaused(
            address(this),
            providers[_providerKey].providerAddress
        );
        return true;
    }

    function registerSwappingProvider(
        address payable _providerAddress,
        bytes32 _providerKey
    )
        external
        isSwappingProviderNewOrUpdate(_providerKey, msg.sender)
        onlySuperUser()
        returns (bool)
    {
        require(
            _providerKey != bytes32(0x0),
            "Provider key must not be 0x0."
        );
        require(
            _providerAddress != address(0x0),
            "Provider address must not be 0x0."
        );

        providers[_providerKey] = StablePayCommon.SwappingProvider({
            providerAddress: _providerAddress,
            ownerAddress: msg.sender,
            createdAt: now,
            pausedByOwner: false,
            pausedByAdmin: true,
            exists: true
        });
        providersRegistry.add(_providerKey);

        emit NewSwappingProviderRegistered(
            address(this),
            _providerKey,
            providers[_providerKey].providerAddress,
            providers[_providerKey].ownerAddress,
            providers[_providerKey].createdAt
        );

        return true;
    }

    function unregisterSwappingProvider(bytes32 providerKey)
        external
        swappingProviderExists(providerKey)
        onlySuperUser()
        returns (bool)
    {
        require(
            providerKey != bytes32(0x0),
            "Provider key must not be 0x0."
        );

        address providerAddress = providers[providerKey].providerAddress;

        delete providers[providerKey];
        providersRegistry.remove(providerKey);

        emit SwappingProviderUnRegistered(
            address(this),
            providerKey,
            providerAddress,
            msg.sender,
            now
        );

        return true;
    }
}
