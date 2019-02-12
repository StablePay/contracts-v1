pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "./erc20/ERC20.sol";
import "./base/Base.sol";
import "./interface/IProviderRegistry.sol";
import "./util/SafeMath.sol";
import "./util/Bytes32ArrayLib.sol";
import "./util/StablePayCommon.sol";
import "./providers/ISwappingProvider.sol";

contract StablePay is Base {
    using SafeMath for uint256;
    using Bytes32ArrayLib for bytes32[];

    /** Properties */

    /** Events */

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

    /*** Modifiers ***************/

    /*** Constructor ***************/

    constructor(address _storageAddress)
        public Base(_storageAddress) {
    }


    /*** Fallback Method ***************/

    function () public payable {
        require(msg.value > 0, "Msg value > 0");
        emit DepositReceived(
            address(this),
            msg.sender,
            msg.value
        );
    }

    /*** Methods ***************/

    function getProviderRegistry()
        public
        view
        returns (IProviderRegistry) {
        address stablePayStorageAddress = _storage.getAddress(keccak256(abi.encodePacked('contract.name','StablePayStorage')));
        return IProviderRegistry(stablePayStorageAddress);
    }

    function getSwappingProvider(bytes32 _providerKey)
        public
        view
        returns (StablePayCommon.SwappingProvider){
        return getProviderRegistry().getSwappingProvider(_providerKey);
    }

    function payWithToken(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    nonReentrant()
    returns (bool)
    {
        require(_providerKeys.length > 0, "Provider keys must not be empty.");

        for (uint256 index = 0; index < _providerKeys.length; index = index.add(1)) {
            bytes32 _providerKey = _providerKeys[index];
            /*
            TODO The validation process may be delegated to the SwappingProvider smart contract using a method ```iSwappingProvider.isOrderValid(order);```
            */
            if(getProviderRegistry().isSwappingProviderValid(_providerKey)) {
                require(ERC20(order.sourceToken).allowance(msg.sender, address(this)) >= order.sourceAmount, "Not enough allowed tokens to StablePay.");

                StablePayCommon.SwappingProvider memory swappingProvider = getSwappingProvider(_providerKey);

                require(ERC20(order.sourceToken).transferFrom(msg.sender, swappingProvider.providerAddress, order.sourceAmount), "Transfer from StablePay was not successful.");

                uint stablePayInitialBalance = ERC20(order.targetToken).balanceOf(address(this));

                ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);

                if(iSwappingProvider.swapToken(order)) {
                    uint stablePaySourceBalance = ERC20(order.sourceToken).balanceOf(address(this));
                    
                    require(
                        ERC20(order.sourceToken).transfer(msg.sender, stablePaySourceBalance),
                        "Transfer to customer failed."
                    );

                    uint stablePayTargetBalance = ERC20(order.targetToken).balanceOf(address(this));
                    require(stablePayTargetBalance == order.targetAmount, "StablePay target balance is not valid.");
                    
                    require(
                        ERC20(order.targetToken).transfer(order.merchantAddress, stablePayTargetBalance),
                        "Transfer to merchant failed."
                    );

                    emit PaymentSent(
                        address(this),
                        order.merchantAddress,
                        msg.sender,
                        order.sourceToken,
                        order.targetToken,
                        stablePayTargetBalance
                    );

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

    function payWithEther(StablePayCommon.Order order, bytes32[] _providerKeys)
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
            if(getProviderRegistry().isSwappingProviderValid(_providerKey)) {
                StablePayCommon.SwappingProvider memory swappingProvider = getSwappingProvider(_providerKey);
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