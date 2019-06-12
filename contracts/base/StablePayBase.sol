pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../erc20/ERC20.sol";
import "../base/Base.sol";
import "../interface/ISettings.sol";
import "../interface/IProviderRegistry.sol";
import "../interface/IStablePay.sol";
import "../util/SafeMath.sol";
import "../util/Bytes32ArrayLib.sol";
import "../providers/ISwappingProvider.sol";

contract StablePayBase is Base, IStablePay {
    using SafeMath for uint256;
    using Bytes32ArrayLib for bytes32[];

    /** Constants */

    /** Properties */

    /** Events */

    /** Modifiers */

    modifier isSender(address _sender, address _to) {
        require(_sender == _to, "Sender is not equals to 'to' address.");
        _;
    }

    modifier isTokenAvailable(address _tokenAddress, uint256 _amount) {
        bool available;
        uint256 minAmount;
        uint256 maxAmount;
        // TODO move this logic to the Settings smart contract.
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
    modifier areOrderAmountsValidEther(StablePayCommon.Order _order) {
        require(_order.targetAmount > 0, "Target amount > 0.");
        _;
    }

    /** Constructor */

    constructor(address _storageAddress)
        public Base(_storageAddress) {
    }

    /** Fallback Method */

    /** Functions */

    /**
        @dev Get the current Settings smart contract configured in the platform.
     */
	// TODO Move to Base.sol
    function getSettings()
        internal
        view
        returns (ISettings) {
        address settingsAddress = _storage.getAddress(keccak256(abi.encodePacked(CONTRACT_NAME, SETTINGS_NAME)));
        return ISettings(settingsAddress);
    }

    /**
        @dev Get the current ProviderRegistry smart contract configured in the platform.
     */
	// TODO Move to Base.sol
    function getProviderRegistry()
        internal
        view
        returns (IProviderRegistry) {
        address stablePayStorageAddress = _storage.getAddress(keccak256(abi.encodePacked(CONTRACT_NAME, STABLE_PAY_STORAGE_NAME)));
        return IProviderRegistry(stablePayStorageAddress);
    }

    /**
        @dev Get the swapping provider struct for a given provider key.
     */
    function getSwappingProvider(bytes32 _providerKey)
        public
        view
        returns (StablePayCommon.SwappingProvider){
        return getProviderRegistry().getSwappingProvider(_providerKey);
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

    /**
        @dev It transfers a specific amount of tokens as a fee to the platform Vault smart contract.
        @dev It throws a require error if the transfer result is not success. 
        @dev Otherwise it returns true.
     */
    function transferFee(address _tokenAddress, uint256 _feeAmount)
    internal
    returns (bool)
    {
        if(_feeAmount > 0) {
            bool result = ERC20(_tokenAddress).transfer(getVault(), _feeAmount);
            require(result, "Tokens transfer to vault was invalid.");
        }
        return true;
    }

    /** 
        @dev Verify the given allowance to a spender against a specific amount.
        @dev It throws a require error if the allowance is not higher (or equals) than the specific amount.
        @dev Otherwise it returns true.
     */
    function allowanceHigherOrEquals(address token, address owner, address spender, uint amount)
    internal
    view
    returns (bool)
    {
        uint allowanceResult = ERC20(token).allowance(owner, spender);
        require(allowanceResult >= amount, "Not enough allowed tokens to StablePay.");
        return true;
    }

    /**
        @dev It transfers an amount of tokens to a specific address.
        @dev It throws a require error, if the transfer from result is false.
        @dev Otherwise it returns true.
     */
    function transferFrom(address token, address from, address to, uint256 amount)
    internal
    returns (bool)
    {
        if(amount > 0) {
            bool transferFromResult = ERC20(token).transferFrom(from, to, amount);
            require(transferFromResult, "Transfer from StablePay was not successful.");
        }
        return true;
    }

    /**
        @dev It gets the current balance for this smart contract for a specific token (ERC20).
        @dev It returns the balance. 
     */
    function getTokenBalanceOf(address token)
    internal
    view
    returns (uint)
    {
        return ERC20(token).balanceOf(address(this));
    }

    /**
        @dev It gets the current ether balance for this smart contract.
        @dev It returns the current balance.
     */
    function getEtherBalanceOf()
    internal
    view
    returns (uint)
    {
        return address(this).balance;
    }

    /**
        @dev It transfers tokens (diff between final - initial balance) to a specific address when diff is higher than zero.
        @dev If final balance is lower than initial balance, it throws a require error.
     */
    function transferDiffSourceTokensIfApplicable(address token, address to, uint initialBalance, uint finalBalance)
    internal
    returns (bool)
    {
        require(finalBalance >= initialBalance, "StablePayBase Token: Final balance >= initial balance.");
        uint tokensDiff = finalBalance.sub(initialBalance);
        if(tokensDiff > 0) {
            bool transferResult = ERC20(token).transfer(to, tokensDiff);
            require(transferResult, "Transfer tokens back failed.");
        }
        return true;
    }

    function calculateDiffBalance(uint sentAmount, uint initialBalance, uint finalBalance)
    internal
    pure
    returns (uint diffBalance)
    {
        require(initialBalance >= finalBalance, "SwappingProvider Ether: Initial balance >= final balance.");
        uint used = initialBalance.sub(finalBalance);
        require(sentAmount >= used, "SwappingProvider Ether: Sent amount >= used.");
        return sentAmount.sub(used);
    }

    /**
        @dev It transfers back to an address the diff balances.
        @dev It assumes that the contract may already have balance.
        @dev Base on that, this function get the diff balance between what the sender sent and paid. The diff is transfer back to the sender.
        @dev Remember: After the swapping the final balance is lower than initial balance.
     */
    function transferDiffEtherBalanceIfApplicable(address to, uint sentAmount, uint initialBalance, uint finalBalance)
    internal
    returns (bool)
    {
        uint diffAmount = calculateDiffBalance(sentAmount, initialBalance, finalBalance);
        if(diffAmount > 0) {
            to.transfer(diffAmount);
        }
        return true;
    }

    /**
        @dev It checks whether the diff between final and initial balance is equals to a target amount.
        @dev If diff balance is not equals to target amount, it throws a require error.
     */
    function checkCurrentTargetBalance(uint targetAmount, uint initialBalance, uint finalBalance)
    internal
    pure
    returns (bool)
    {
        require(finalBalance >= initialBalance, "StablePayBase: Final balance >= initial balance.");
        uint currentBalance = finalBalance.sub(initialBalance);
        require(currentBalance == targetAmount, "Target final tokens balance is not valid.");
        return true;
    }

    /**
        @dev Calculate the platform fee amount based on the order target amount and platform fee.
        @dev Transfer the calculated fee amount. 
     */
    function calculateAndTransferFee(StablePayCommon.Order order)
    internal
    returns (bool success, uint feeAmount)
    {
        // Calculate the fee amount based on the target amount and the platform fee.
        uint currentFeeAmount = getFeeAmount(order);
        // Transfer the fee amount
        transferFee(order.targetToken, currentFeeAmount);
        return (true, currentFeeAmount);
    }

    /**
        @dev Calculate the 'to' amount based on the order target amount and platform fee amount.
        @dev Transfer the 'to' amount to 'to' address defined in order.
     */
    function calculateAndTransferToAmount(StablePayCommon.Order order, uint feeAmount)
    internal
    returns (bool success, uint toAmount)
    {
        // Calculate the 'to' amount.
        uint256 currentToAmount = order.targetAmount.sub(feeAmount);
        // Transfer the 'to' amount to the 'to' address.
        bool result = ERC20(order.targetToken).transfer(order.toAddress, currentToAmount);
        require(result, "Transfer to 'to' address failed.");
        return (true, currentToAmount);
    }

    /**
        @dev Transfer tokens to the 'to' address if source / target tokens are equal.
        @dev It returns true when source and target tokens are equals. Otherwise it returns false.
     */
    function transferTokensIfTokensAreEquals(StablePayCommon.Order order)
    internal
    returns (bool){
        // Verify if token addresses are equal.
        bool _isTransferTokens = order.sourceToken == order.targetToken;
        if(_isTransferTokens) { // Source / Target tokens are equal.
            // Check tokens allowance.
            uint allowanceResult = ERC20(order.sourceToken).allowance(msg.sender, address(this));
            require(allowanceResult >= order.targetAmount, "Not enough allowed tokens to StablePay.");

            // Transfer tokens to the 'to' address without paying platform fees.
            bool transferFromResult = ERC20(order.sourceToken).transferFrom(msg.sender, order.toAddress, order.targetAmount);
            require(transferFromResult, "Transfer from StablePay was not successful.");

            // Emit PaymentSent event for the from/to order.
            emitPaymentSentEvent(order, order.targetAmount);

            // Emit ExecutionTransferSuccess event for StablePay.
            emitExecutionTransferSuccessEvent(order, uint256(0), order.targetAmount, 0x0);
        }
        return _isTransferTokens;
    }

    /**
        @dev It executes the swapping process associated to an order for a specific provider key.
        @dev It returns true if the swapping was executed successfully. Otherwise, it returns false.
     */
    function doTransferWithTokens(StablePayCommon.Order order, bytes32 _providerKey)
    internal
    returns (bool)
    {
        // Verify if the swapping provider is valid.
        if(getProviderRegistry().isSwappingProviderValid(_providerKey)) {
            // Check tokens allowance to StablePayBase smart contract.
            allowanceHigherOrEquals(order.sourceToken, msg.sender, address(this), order.sourceAmount);

            // Get the swapping provider (struct) for the given provider key.
            StablePayCommon.SwappingProvider memory swappingProvider = getSwappingProvider(_providerKey);

            // Transfer tokens from StablePayBase to swapping provider.
            transferFrom(order.sourceToken, msg.sender, swappingProvider.providerAddress, order.sourceAmount);
            
            // Get the current source/target token balances for StablePay. 
            uint stablePaySourceInitialBalance = getTokenBalanceOf(order.sourceToken);
            uint stablePayTargetInitialBalance = getTokenBalanceOf(order.targetToken);

            // Get the swapping provider (smart contract) to make the swapping.
            ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);

            // Execute the swapping token using a given provider.
            if(iSwappingProvider.swapToken(order)) {
                // Get source token balance for StablePay.
                uint stablePaySourceFinalBalance = getTokenBalanceOf(order.sourceToken);

                // Transfer the difference between initial/final tokens to the 'to' address when the diff > 0.
                // The final balance is higher than initial
                transferDiffSourceTokensIfApplicable(order.sourceToken, msg.sender, stablePaySourceInitialBalance, stablePaySourceFinalBalance);
                
                // Get target token balance for StablePay
                uint stablePayTargetFinalBalance = getTokenBalanceOf(order.targetToken);

                // Check current StablePay target token balance. It must be equals to order target amount.
                checkCurrentTargetBalance(order.targetAmount, stablePayTargetInitialBalance, stablePayTargetFinalBalance);

                uint feeAmount;
                // Calculate and transfer the platform fee amount.
                (, feeAmount) = calculateAndTransferFee(order);

                // Calculate and transfer the 'to' amount.
                uint toAmount;
                (, toAmount) = calculateAndTransferToAmount(order, feeAmount);

                // Emit PaymentSent event for the from/to order.
                emitPaymentSentEvent(order, toAmount);

                // Emit ExecutionTransferSuccess event for StablePay.
                emitExecutionTransferSuccessEvent(order, feeAmount, toAmount, _providerKey);

                return true;
            } else {
                // Emit ExecutionTransferFailed event for StablePay.
                emitExecutionTransferFailedEvent(order, swappingProvider.providerAddress, _providerKey);
            }
        }
        return false;
    }

    function transferWithTokens(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    isNotPaused()
    nonReentrant()
    isTokenAvailable(order.targetToken, order.targetAmount)
    areOrderAmountsValidToken(order)
    isSender(msg.sender, order.fromAddress)
    returns (bool)
    {
        // Transfer tokens if source / target tokens are equal.
        if(transferTokensIfTokensAreEquals(order)) {
            return true;
        }
        require(_providerKeys.length > 0, "Provider keys must not be empty.");

        for (uint256 index = 0; index < _providerKeys.length; index = index.add(1)) {
            bytes32 _providerKey = _providerKeys[index];
            bool swapSuccess = doTransferWithTokens(order, _providerKey);
            if(swapSuccess) {
                return true;
            }
        }
        require(false, "Swapping token could not be processed.");
    }

    function doTransferWithEthers(StablePayCommon.Order order, bytes32 _providerKey)
    internal
    returns (bool)
    {
        // Verify if the swapping provider is valid.
        if(getProviderRegistry().isSwappingProviderValid(_providerKey)) {
            // Get the swapping provider (struct) for the given provider key.
            StablePayCommon.SwappingProvider memory swappingProvider = getSwappingProvider(_providerKey);

            // Get the initial source/target balances.
            uint stablePayInitialSourceBalance = getEtherBalanceOf();
            uint stablePayInitialTargetBalance = getTokenBalanceOf(order.targetToken);

            // Get the swapping provider (smart contract) to make the swapping.
            ISwappingProvider iSwappingProvider = ISwappingProvider(swappingProvider.providerAddress);

            // Execute the swapping process using a specific provider.
            if(iSwappingProvider.swapEther.value(msg.value)(order)) {
                // Get the final source/target balances.
                uint stablePayFinalSourceBalance = getEtherBalanceOf();
                uint stablePayFinalTargetBalance = getTokenBalanceOf(order.targetToken);

                // Transfer back the Ether left to the 'to' address.
                transferDiffEtherBalanceIfApplicable(msg.sender, msg.value, stablePayInitialSourceBalance, stablePayFinalSourceBalance);

                // Check current StablePay target token balance. It must be equals to order target amount.
                checkCurrentTargetBalance(order.targetAmount, stablePayInitialTargetBalance, stablePayFinalTargetBalance);

                uint feeAmount;
                // Calculate and transfer the platform fee amount.
                (, feeAmount) = calculateAndTransferFee(order);

                // Calculate and transfer the 'to' amount.
                uint toAmount;
                (, toAmount) = calculateAndTransferToAmount(order, feeAmount);
  
                // Emit PaymentSent event for the from/to order.
                emitPaymentSentEvent(order, toAmount);

                // Emit ExecutionTransferSuccess event for StablePay.
                emitExecutionTransferSuccessEvent(order, feeAmount, toAmount, _providerKey);

                return true;
            } else {
                // Emit ExecutionTransferFailed event for StablePay.
                emitExecutionTransferFailedEvent(order, swappingProvider.providerAddress, _providerKey);
            }
        }
        return false;
    }

    function transferWithEthers(StablePayCommon.Order order, bytes32[] _providerKeys)
    public
    isNotPaused()
    nonReentrant()
    isTokenAvailable(order.targetToken, order.targetAmount)
    areOrderAmountsValidEther(order)
    isSender(msg.sender, order.fromAddress)
    payable
    returns (bool)
    {
        require(_providerKeys.length > 0, "Provider keys must not be empty.");

        for (uint256 index = 0; index < _providerKeys.length; index = index.add(1)) {
            bytes32 _providerKey = _providerKeys[index];
            bool swapSuccess = doTransferWithEthers(order, _providerKey);
            if(swapSuccess) {
                return true;
            }
        }
        require(false, "Swap with ether could not be performed..");
        return true;
    }

    function emitExecutionTransferFailedEvent(StablePayCommon.Order _order, address _providerAddress, bytes32 _providerKey)
    internal {
        emit ExecutionTransferFailed(
            address(this),
            _providerAddress,
            _order.sourceToken,
            _order.targetToken,
            _order.fromAddress,
            _order.toAddress,
            now,
            _providerKey,
            _order.data
        );
    }

    function emitExecutionTransferSuccessEvent(StablePayCommon.Order _order, uint feeAmount, uint toAmount, bytes32 _providerKey)
    internal {
        // Note: Provider address is not added due to a Stack too deep error. It can be taken from provider key.
        uint16 platformFee = _order.sourceToken == _order.targetToken ? 0 : getSettings().getPlatformFee();
        emit ExecutionTransferSuccess(
            address(this),
            _providerKey,
            _order.sourceToken,
            _order.targetToken,
            _order.fromAddress,
            _order.toAddress,
            toAmount,
            feeAmount,
            now,
            platformFee,
            _order.data
        );

    }
}
