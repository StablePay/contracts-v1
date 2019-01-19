pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "./erc20/ERC20.sol";
import "./base/Base.sol";
import "./util/SafeMath.sol";
import "./util/Bytes32ArrayLib.sol";
import "./util/StablePayCommon.sol";
import "./providers/ISwappingProvider.sol";

contract StablePay is Base {
    using SafeMath for uint256;
    using Bytes32ArrayLib for bytes32[];

    /** Properties */

    address public owner;

    /**
        @dev This mapping is used to store providers to swap tokens.
     */
    mapping (bytes32 => StablePayCommon.SwappingProvider) public providers;

    /**
        @dev This registry is used to know all the providers created in StablePay.
     */
    bytes32[] public providersRegistry;



    /**** Events ***********/

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
        @dev This event is emitted when a swap execution has failed.
     */
    event SwapExecutionFailed(
        address indexed thisContract,
        address indexed providerAddress,
        bytes32 providerKey
    );

    /**
        @dev This event is emitted when a swap has been executed successfully.
     */
    event SwapExecutionSuccess(
        address indexed thisContract,
        address indexed providerAddress,
        bytes32 providerKey
    );

    /**
        @dev This event is emitted when a swap ETH has been executed successfully.
     */
    event SwapEthExecutionFailed(
        address indexed thisContract,
        address indexed strategyAddress,
        bytes32 providerKey
    );

    /**
        @dev This event is emitted when a swap ETH has been executed successfully.
     */
    event SwapEthExecutionSuccess(
        address indexed thisContract,
        address indexed strategyAddress,
        bytes32 providerKey
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

    /*** Modifiers ***************/

    modifier isOwner(address _anAddress) {
        require(msg.sender == _anAddress);
        _;
    }

    modifier swappingProviderExists(bytes32 _providerKey) {
        require(providers[_providerKey].exists == true, "Swapping provider must exist.");
        _;
    }

    modifier isSwappingProviderOwner(bytes32 _providerKey, address _owner) {
        require(providers[_providerKey].ownerAddress == _owner, "Swapping provider owner is not valid.");
        _;
    }

    modifier _isSwappingProviderPaused(bytes32 _providerKey) {
        require(providers[_providerKey].paused == true, "Swapping provider must be paused.");
        _;
    }

    modifier isSwappingProviderNewOrUpdate(bytes32 _providerKey, address _owner) {
        StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];

        bool isNewOrUpdate =    ( swappingProvider.exists && swappingProvider.ownerAddress == _owner ) ||
                                ( !swappingProvider.exists );
        require(isNewOrUpdate, "Swapping provider must be new or an update by owner.");
        _;
    }

    /*** Constructor ***************/

    constructor(address _storageAddress)
        public Base(_storageAddress) {
        owner = msg.sender;
    }


    /*** Fallback Method ***************/

    function () public payable {}

    /*** Methods ***************/
    function getSwappingProvider(bytes32 _providerKey)
        public
        view
        returns (address providerAddress, address ownerAddress, bool paused, bool exists){
            StablePayCommon.SwappingProvider memory provider = providers[_providerKey];
            return (
                provider.providerAddress,
                provider.ownerAddress,
                provider.paused,
                provider.exists
            );
    }

    function isSwappingProviderPaused(bytes32 _providerKey)
        public
        view
        returns (bool){
            return  providers[_providerKey].exists && 
                    providers[_providerKey].paused;
    }

    function isSwappingProviderValid(bytes32 _providerKey)
        internal
        view
        returns (bool){
            return providers[_providerKey].exists && !providers[_providerKey].paused;
    }

    function getProvidersRegistryCount()
        public
        view
        returns (uint256){
            return providersRegistry.length;
    }

    function pauseSwappingProvider(bytes32 _providerKey)
        public
        swappingProviderExists(_providerKey)
        isSwappingProviderOwner(_providerKey, msg.sender)
        returns (bool){

        providers[_providerKey].paused = true;

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
        _isSwappingProviderPaused(_providerKey)
        returns (bool){

        providers[_providerKey].paused = false;

        emit SwappingProviderUnpaused(
            address(this),
            providers[_providerKey].providerAddress          
        );
        return true;
    }

    function registerSwappingProvider(
        address _providerAddress,
        bytes32 _providerKey,
        address _owner
    )
    internal
    isSwappingProviderNewOrUpdate(_providerKey, _owner)
    returns (bool)
    {
        require(_providerAddress != 0x0, "Provider address must not be 0x0.");

        providers[_providerKey] = StablePayCommon.SwappingProvider({
            providerAddress: _providerAddress,
            ownerAddress: _owner,
            createdAt: now,
            paused: false,
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

    function registerSwappingProvider(
        address _providerAddress,
        bytes32 _providerKey
    )
    public
    isSwappingProviderNewOrUpdate(_providerKey, msg.sender)
    returns (bool)
    {
        return registerSwappingProvider(_providerAddress, _providerKey, msg.sender);
    }

    function getExpectedRate(bytes32 _providerKey, ERC20 _sourceToken, ERC20 _targetToken, uint _amount)
    public
    view
    returns (uint)
    {
        StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];

        ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);

        return iSwappingProvider.getExpectedRate(_sourceToken, _targetToken, _amount);
    }

    function swapToken(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    returns (bool)
    {
        require(_providerKeys.length > 0, "Provider keys must not be empty.");

        for (uint256 index = 0; index < _providerKeys.length; index = index.add(1)) {
            bytes32 _providerKey = _providerKeys[index];
            /*
            TODO The validation process may be delegated to the SwappingProvider smart contract using a method ```iSwappingProvider.isOrderValid(order);```
            */
            if(isSwappingProviderValid(_providerKey)) {
                ERC20 sourceToken = ERC20(order.sourceToken);
                require(sourceToken.allowance(msg.sender, address(this)) >= order.amount, "Not enough allowed tokens to StablePay.");

                StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];

                require(sourceToken.transferFrom(msg.sender, swappingProvider.providerAddress, order.amount), "Transfer from StablePay was not successful.");

                ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);

                bool result = iSwappingProvider.swapToken(order);
                if(result) {
                    emit SwapExecutionSuccess(
                        address(this),
                        swappingProvider.providerAddress,
                        _providerKey
                    );
                    return true;
                } else {
                    emit SwapExecutionFailed(
                        address(this),
                        swappingProvider.providerAddress,
                        _providerKey
                    );
                }
            }
        }
        return false;
    }

    function swapEther(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    payable
    returns (bool)
    {
        require(_providerKeys.length > 0, "Provider keys must not be empty.");

        for (uint256 index = 0; index < _providerKeys.length; index = index.add(1)) {
            bytes32 _providerKey = _providerKeys[index];
            /*
                TODO The validation process may be delegated to the SwappingProvider smart contract using a method ```iSwappingProvider.isOrderValid(order);```
            */
            if(isSwappingProviderValid(_providerKey)) {
                StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];                
                ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);
                
                bool result = iSwappingProvider.swapEther.value(msg.value)(order);
                if(result) {
                    emit SwapEthExecutionSuccess(
                        address(this),
                        swappingProvider.providerAddress,
                        _providerKey
                    );
                    return true;
                } else {
                    emit SwapEthExecutionFailed(
                        address(this),
                        swappingProvider.providerAddress,
                        _providerKey
                    );
                }
            }
        }
        // TODO Does it need a require(false, "Swap could not be performed.") at this point?
        return false;
    }

}