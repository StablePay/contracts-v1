pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../services/erc20/ERC20.sol";
import "../base/Base.sol";
import "../util/SafeMath.sol";
import "../util/Bytes32ArrayLib.sol";
import "../util/StablePayCommon.sol";
import "../providers/ISwappingProvider.sol";
import "../interface/IProviderRegistry.sol";

contract StablePayStorage is Base, IProviderRegistry {
    using SafeMath for uint256;
    using Bytes32ArrayLib for bytes32[];

    /** Properties */

    /**
        @dev This mapping is used to store providers to swap tokens.
     */
    mapping (bytes32 => StablePayCommon.SwappingProvider) public providers;

    /**
        @dev This registry is used to know all the providers created in StablePay.
     */
    bytes32[] public providersRegistry;

    /** Modifiers */

    modifier swappingProviderExists(bytes32 providerKey) {
        require(providers[providerKey].exists == true, "Swapping provider must exist.");
        _;
    }

    modifier isSwappingProviderOwner(bytes32 providerKey, address owner) {
        require(providers[providerKey].ownerAddress == owner, "Swapping provider owner is not valid.");
        _;
    }

    modifier isSwappingProviderPausedByOwner(bytes32 providerKey) {
        require(providers[providerKey].pausedByOwner == true, "Swapping provider must be paused.");
        _;
    }

    modifier isSwappingProviderPausedByAdmin(bytes32 providerKey) {
        require(providers[providerKey].pausedByAdmin == true, "Swapping provider must be paused.");
        _;
    }

    modifier isSwappingProviderNotPausedByAdmin(bytes32 providerKey) {
        require(providers[providerKey].pausedByAdmin == false, "Swapping provider must not be paused by admin.");
        _;
    }

    modifier isSwappingProviderNewOrUpdate(bytes32 providerKey, address owner) {
        StablePayCommon.SwappingProvider storage swappingProvider = providers[providerKey];

        bool isNewOrUpdate =    ( swappingProvider.exists && swappingProvider.ownerAddress == owner ) ||
                                ( !swappingProvider.exists );
        require(isNewOrUpdate, "Swapping provider must be new or an update by owner.");
        _;
    }

    /** Constructor */

    constructor(address storageAddress)
        public Base(storageAddress) {
    }

    /** Fallback Method */
	// TODO Review fallback function.

    function () external payable {
        require(msg.value > 0, "Msg value > 0");
        emit DepositReceived(
            address(this),
            msg.sender,
            msg.value
        );
    }

    /** Functions */

    function getExpectedRate(bytes32 providerKey, ERC20 sourceToken, ERC20 targetToken, uint targetAmount)
        public
        view
        returns (bool isSupported, uint minRate, uint maxRate) {
        require(isSwappingProviderValid(providerKey), "Provider must exist and be enabled.");
        StablePayCommon.SwappingProvider memory swappingProvider = providers[providerKey];
        ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);
        return iSwappingProvider.getExpectedRate(sourceToken, targetToken, targetAmount);
    }

    function getSupportedExpectedRatesCount(ERC20 sourceToken, ERC20 targetToken, uint targetAmount)
        internal
        view
        returns (uint) {
        uint count = 0;
        for (uint256 index = 0; index < providersRegistry.length; index = index.add(1)) {
            bytes32 _providerKey = providersRegistry[index];
            if(isSwappingProviderValid(_providerKey)) {
                ISwappingProvider iSwappingProvider = ISwappingProvider(providers[_providerKey].providerAddress);
                bool isSupported;
                (isSupported, , ) = iSwappingProvider.getExpectedRate(sourceToken, targetToken, targetAmount);
                if(isSupported) {
                    count = count.add(1);
                }
            }
        }
        return count;
    }

    function getExpectedRates(ERC20 sourceToken, ERC20 targetToken, uint targetAmount)
        public
        view
        returns (StablePayCommon.ExpectedRate[] memory expectedRates) {
        expectedRates = new StablePayCommon.ExpectedRate[](getSupportedExpectedRatesCount(sourceToken, targetToken, targetAmount));
        uint currentIndex = 0;
        for (uint256 index = 0; index < providersRegistry.length; index = index.add(1)) {
            bytes32 _providerKey = providersRegistry[index];
            if(isSwappingProviderValid(_providerKey)) {
                StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];
                ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);
                uint minRate;
                uint maxRate;
                bool isSupported;
                (isSupported, minRate, maxRate) = iSwappingProvider.getExpectedRate(sourceToken, targetToken, targetAmount);
                if(isSupported) {
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

    function getExpectedRateRange(ERC20 sourceToken, ERC20 targetToken, uint targetAmount)
        public
        view
        returns (uint minRate, uint maxRate) {
            uint minRateResult = 0;
            uint maxRateResult = 0;

            for (uint256 index = 0; index < providersRegistry.length; index = index.add(1)) {
                bytes32 _providerKey = providersRegistry[index];
                if(isSwappingProviderValid(_providerKey)) {
                    StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];
                    ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);
                    uint minRateProvider;
                    uint maxRateProvider;
                    bool isSupported;
                    (isSupported, minRateProvider, maxRateProvider) = iSwappingProvider.getExpectedRate(sourceToken, targetToken, targetAmount);
                    
                    if(isSupported) {
                        if(minRateResult == 0 || minRateProvider < minRateResult) {
                            minRateResult = minRateProvider;
                        }
                        if(maxRateResult == 0 || maxRateProvider > maxRateResult) {
                            maxRateResult = maxRateProvider;
                        }
                    }
                }
            }
            return (minRateResult, maxRateResult);
    }

    function getSwappingProvider(bytes32 providerKey)
        public
        view
        returns (StablePayCommon.SwappingProvider memory){
        return providers[providerKey];
    }

    function isSwappingProviderPaused(bytes32 providerKey)
        public
        view
        returns (bool){
            return  providers[providerKey].exists &&
                    (
                        providers[providerKey].pausedByOwner ||
                        providers[providerKey].pausedByAdmin
                    );
    }

    function isSwappingProviderValid(bytes32 providerKey)
        public
        view
        returns (bool){
            return  providers[providerKey].exists &&
                    !providers[providerKey].pausedByOwner &&
                    !providers[providerKey].pausedByAdmin ;
    }

    function getProvidersRegistryCount()
        public
        view
        returns (uint256){
            return providersRegistry.length;
    }

    function pauseByAdminSwappingProvider(bytes32 _providerKey)
        public
        swappingProviderExists(_providerKey)
        isSwappingProviderNotPausedByAdmin(_providerKey)
        onlySuperUser()
        returns (bool){

        providers[_providerKey].pausedByAdmin = true;

        emit SwappingProviderPaused(
            address(this),
            providers[_providerKey].providerAddress          
        );
        return true;
    }

    function unpauseByAdminSwappingProvider(bytes32 _providerKey)
        public
        swappingProviderExists(_providerKey)
        isSwappingProviderPausedByAdmin(_providerKey)
        onlySuperUser()
        returns (bool){

        providers[_providerKey].pausedByAdmin = false;

        emit SwappingProviderUnpaused(
            address(this),
            providers[_providerKey].providerAddress          
        );
        return true;
    }

    function pauseSwappingProvider(bytes32 _providerKey)
        public
        swappingProviderExists(_providerKey)
        isSwappingProviderOwner(_providerKey, msg.sender)
        isSwappingProviderNotPausedByAdmin(_providerKey)
        returns (bool){

        providers[_providerKey].pausedByOwner = true;

        emit SwappingProviderPaused(
            address(this),
            providers[_providerKey].providerAddress          
        );
        return true;
    }

    function unpauseSwappingProvider(bytes32 _providerKey)
        public
        swappingProviderExists(_providerKey)
        isSwappingProviderOwner(_providerKey, msg.sender)
        isSwappingProviderPausedByOwner(_providerKey)
        isSwappingProviderNotPausedByAdmin(_providerKey)
        returns (bool){

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
    public
    isSwappingProviderNewOrUpdate(_providerKey, msg.sender)
    returns (bool)
    {
        require(_providerAddress != address(0x0), "Provider address must not be 0x0.");

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
}