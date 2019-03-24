pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../erc20/ERC20.sol";
import "../base/Base.sol";
import "../interface/ISettings.sol";
import "../interface/IProviderRegistry.sol";
import "../interface/IStablePay.sol";
import "../util/SafeMath.sol";
import "../util/Bytes32ArrayLib.sol";
import "../util/StablePayCommon.sol";
import "../providers/ISwappingProvider.sol";

contract StablePayBase is Base, IStablePay {
    using SafeMath for uint256;
    using Bytes32ArrayLib for bytes32[];

    /** Properties */

    /** Events */

    /** Modifiers */

    modifier isTokenAvailable(address _tokenAddress, uint256 _amount) {
        bool available;
        uint256 minAmount;
        uint256 maxAmount;
        (available, minAmount, maxAmount) = getSettings().getTokenAvailability(_tokenAddress);
        require(available, "Token address is not available.");
        require(_amount >= minAmount, "Amount >= min amount.");
        require(_amount <= maxAmount, "Amount <= max amount.");
        _;
    }

    modifier areOrderAmountsValidToken(StablePayCommon.Order _order) {
        require(_order.sourceAmount > 0, "Source amount > 0.");
        require(_order.targetAmount > 0, "Target amount > 0.");
        _;
    }
    modifier areOrderAmountsValidETH(StablePayCommon.Order _order) {

        require(_order.targetAmount > 0, "Target amount > 0.");
        _;
    }

    /** Constructor */

    constructor(address _storageAddress)
        public Base(_storageAddress) {
    }

    /** Fallback Method */

    function () public payable {
        require(msg.value > 0, "Msg value > 0");
        emit DepositReceived(
            address(this),
            msg.sender,
            msg.value
        );
    }

    /** Functions */

    function getVault()
        internal
        view
        returns (address) {
        return _storage.getAddress(keccak256(abi.encodePacked('contract.name','Vault')));
    }

    function getSettings()
        internal
        view
        returns (ISettings) {
        address settingsAddress = _storage.getAddress(keccak256(abi.encodePacked('contract.name','Settings')));
        return ISettings(settingsAddress);
    }

    function getProviderRegistry()
        internal
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

    function emitSwapExecutionFailedEvent(address _providerAddress, bytes32 _providerKey)
    internal {
        emit SwapExecutionFailed(
            address(this),
            _providerAddress,
            _providerKey
        );
    }

    function emitSwapExecutionSuccessEvent(address _providerAddress, bytes32 _providerKey)
    internal {
        emit SwapExecutionSuccess(
            address(this),
            _providerAddress,
            _providerKey
        );
    }

    function emitPaymentSentEvent(StablePayCommon.Order order, uint256 amountSent)
    internal {
        emit PaymentSent(
            address(this),
            order.merchantAddress,
            msg.sender,
            order.sourceToken,
            order.targetToken,
            amountSent
        );
    }
    
    /**
        @dev Calculates the fee amount based on the target amount and the pre configured platform fee value.
        @dev Uses the AVOID_DECIMALS in order to avoid loss precision in division operations.
     */
    function getFeeAmount(StablePayCommon.Order order)
    internal
    view
    returns (uint256) {
        // In order to support decimals, the platform fee value is multiplied by 100.
        uint256 platformFee = uint256(getSettings().getPlatformFee());

        // Multiply by high value to avoid decimals, and div by 100 to delete the initial 100 value.
        uint256 platformFeeAvoidDecimals = platformFee.mul(AVOID_DECIMALS).div(100);

        // Calculating the fee amount with 'avoid decimal'.
        uint256 feeAmountAvoidDecimals = platformFeeAvoidDecimals.mul(order.targetAmount).div(100);

        // Removing the avoid decimals value.
        return feeAmountAvoidDecimals.div(AVOID_DECIMALS);
    }

    function transferFee(address _tokenAddress, uint256 _feeAmount)
    internal
    returns (bool)
    {
        bool result = ERC20(_tokenAddress).transfer(getVault(), _feeAmount);
        require(result, "Tokens transfer to vault was invalid.");
        return true;
    }

    function doPayWithToken(StablePayCommon.Order order, bytes32 _providerKey)
    internal
    returns (bool)
    {
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
                uint stablePayCurrentBalance = stablePayTargetBalance.sub(stablePayInitialBalance);
                require(stablePayCurrentBalance == order.targetAmount, "StablePay target balance is not valid.");
                
                uint256 feeAmount = getFeeAmount(order);
                uint256 merchantAmount = order.targetAmount - feeAmount;

                transferFee(order.targetToken, feeAmount);
                
                require(
                    ERC20(order.targetToken).transfer(order.merchantAddress, merchantAmount),
                    "Transfer to merchant failed."
                );

                emitPaymentSentEvent(order, stablePayCurrentBalance);

                emitSwapExecutionSuccessEvent(swappingProvider.providerAddress, _providerKey);

                return true;
            } else {
                emitSwapExecutionFailedEvent(swappingProvider.providerAddress, _providerKey);
            }
        }
        return false;
    }

    function isTransferTokens(StablePayCommon.Order order)
    internal
    returns (bool){
        bool _isTransferTokens = order.sourceToken == order.targetToken;
        if(_isTransferTokens) {
            require(ERC20(order.sourceToken).allowance(msg.sender, address(this)) >= order.targetAmount, "Not enough allowed tokens to StablePay.");
            require(ERC20(order.sourceToken).transferFrom(msg.sender, order.merchantAddress, order.targetAmount), "Transfer from StablePay was not successful.");
            emitPaymentSentEvent(order, order.targetAmount);
        }
        return _isTransferTokens;
    }

    function payWithToken(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    isNotPaused()
    nonReentrant()
    isTokenAvailable(order.targetToken, order.targetAmount)
    areOrderAmountsValidToken(order)
    returns (bool)
    {
        if(isTransferTokens(order)) {
            return true;
        }
        require(_providerKeys.length > 0, "Provider keys must not be empty.");

        for (uint256 index = 0; index < _providerKeys.length; index = index.add(1)) {
            bytes32 _providerKey = _providerKeys[index];
            bool swapSuccess = doPayWithToken(order, _providerKey);
            if(swapSuccess) {
                return true;
            }
        }
        require(false, "Swapping token could not be processed.");
    }


    event testEvent(
        uint stablePayTargetBalance,
        uint stablePayInitialSourceBalance,
        uint targetAmount


    );

    function doPayWithEther(StablePayCommon.Order order, bytes32 _providerKey)
    internal
    returns (bool)
    {
        if(getProviderRegistry().isSwappingProviderValid(_providerKey)) {
            StablePayCommon.SwappingProvider memory swappingProvider = getSwappingProvider(_providerKey);
            uint stablePayInitialSourceBalance = address(this).balance;
            ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);

            bool result = iSwappingProvider.swapEther.value(msg.value)(order);
            if(result) {
                uint stablePayFinalSourceBalance = address(this).balance;


                address(msg.sender).transfer(stablePayFinalSourceBalance);

                uint stablePayTargetBalance = ERC20(order.targetToken).balanceOf(address(this));
                testEvent(stablePayTargetBalance,stablePayInitialSourceBalance, order.targetAmount);
                //TODO: add final balance validation and remove test events
//                uint stablePayCurrentBalance = stablePayTargetBalance.sub(stablePayInitialSourceBalance);
//                require(stablePayCurrentBalance == order.targetAmount, "StablePay target balance is not valid.");
//
                uint256 feeAmount = getFeeAmount(order);
                uint256 merchantAmount = order.targetAmount - feeAmount;
                testEvent(feeAmount, merchantAmount, order.targetAmount);

                transferFee(order.targetToken, feeAmount);

                require(
                    ERC20(order.targetToken).transfer(order.merchantAddress, merchantAmount),
                    "Transfer to merchant failed."
                );

                emitPaymentSentEvent(order, stablePayTargetBalance);

                emitSwapEthExecutionSuccessEvent(swappingProvider.providerAddress, _providerKey);

                return true;
            } else {
                emitSwapEthExecutionFailedEvent(swappingProvider.providerAddress, _providerKey);
            }
        }
        return false;
    }

    function payWithEther(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    isNotPaused()
    nonReentrant()
    isTokenAvailable(order.targetToken, order.targetAmount)
    areOrderAmountsValidETH(order)
    payable
    returns (bool)
    {
        require(_providerKeys.length > 0, "Provider keys must not be empty.");
//
        for (uint256 index = 0; index < _providerKeys.length; index = index.add(1)) {
            bytes32 _providerKey = _providerKeys[index];
            bool swapSuccess = doPayWithEther(order, _providerKey);
            if(swapSuccess) {
                return true;
            }
        }
//        require(false, "Swap with ether could not be performed..");
        return true;
    }

    function emitSwapEthExecutionFailedEvent(address _providerAddress, bytes32 _providerKey)
    internal {
        emit SwapEthExecutionFailed(
            address(this),
            _providerAddress,
            _providerKey
        );
    }

    function emitSwapEthExecutionSuccessEvent(address _providerAddress, bytes32 _providerKey)
    internal {
        emit SwapEthExecutionSuccess(
            address(this),
            _providerAddress,
            _providerKey
        );
    }
}