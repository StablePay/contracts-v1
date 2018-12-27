pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "./util/SafeMath.sol";
import "./StablePayCommon.sol";
import "./ISwappingProvider.sol";

contract StablePay {
    using SafeMath for uint256;

    /** Properties */

    address public owner;

    /**
        @dev This mapping is used to store providers to swap tokens.
     */
    mapping (bytes32 => StablePayCommon.SwappingProvider) public providers;

    /**** Events ***********/

    /**
        @dev This event is emitted when a new swapping provider is registered.
     */
    event NewSwappingProviderRegistered(
        address indexed thisContract,
        bytes32 providerKey,
        address swappingProvider,
        address owner
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
        bytes32 _providerKey
    );

    /**
        @dev This event is emitted when a swap ETH has been executed successfully.
     */
    event SwapEthExecutionSuccess(
        address indexed thisContract,
        address indexed strategyAddress,
        bytes32 _providerKey
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

    modifier isSwappingProviderOwner(bytes32 _providerKey, address _owner) {
        require(providers[_providerKey].ownerAddress == _owner, "Swapping provider owner is not valid.");
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

    constructor() public {
        owner = msg.sender;
    }

    /*** Fallback Method ***************/

    function () public payable {}

    /*** Methods ***************/
    function getSwappingProvider(bytes32 _providerKey)
        internal
        view
        returns (StablePayCommon.SwappingProvider){
            return providers[_providerKey];
    }


    function isSwappingProviderValid(bytes32 _providerKey)
        internal
        view
        returns (bool){
            return providers[_providerKey].exists && !providers[_providerKey].paused;
    }

    function pauseSwappingProvider(bytes32 _providerKey)
        public
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
        isSwappingProviderOwner(_providerKey, msg.sender)
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
            paused: false,
            exists: true
        });

        emit NewSwappingProviderRegistered(
            address(this),
            _providerKey,
            _providerAddress,
            _owner
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

    function payToken(StablePayCommon.Order order, bytes32[] _providerKeys)
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
                StablePayCommon.SwappingProvider storage swappingProvider = providers[_providerKey];
                ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);

                bool result = iSwappingProvider.payToken(order);
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

    function payEther(StablePayCommon.Order order, bytes32[] _providerKeys)
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
                
                bool result = iSwappingProvider.payEther.value(msg.value)(order);
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