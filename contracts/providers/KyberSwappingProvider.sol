pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";
import "../services/kyber/KyberNetworkProxyInterface.sol";
import "./AbstractSwappingProvider.sol";

/**
    @title Kyber Network Swapping provider
    @author StablePay <hi@stablepay.io>

    @notice  https://developer.kyber.network/docs/VendorsGuide/#converting-from-erc20
    @notice https://developer.kyber.network/docs/KyberNetworkProxy/#getexpectedrate
 */
contract KyberSwappingProvider is AbstractSwappingProvider {
    IERC20 internal constant ETH_TOKEN_ADDRESS = IERC20(
        0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee
    );
    uint256 internal constant ONE = 1;
    uint256 internal constant TEN = 10;
    uint256 internal constant ETH_DECIMALS = 18;
    address public proxy;
    address public feeAddress;

    /** Events */

    /** Modifiers */

    modifier isValidAddress(address _anAddress) {
        require(_anAddress != address(0x0), "Address must not be empty.");
        _;
    }

    /** Constructor */

    constructor(address stablePayAddress, address proxyAddress, address kyberFeeAddress)
        public
        AbstractSwappingProvider(stablePayAddress)
    {
        proxy = proxyAddress;
        feeAddress = kyberFeeAddress;
    }

    /** Methods */

    function isSupportedRate(uint256 _minRate, uint256 _maxRate)
        internal
        pure
        returns (bool)
    {
        return _minRate > 0 && _maxRate > 0;
    }

    function getKyberNetworkProxy()
        internal
        view
        returns (KyberNetworkProxyInterface)
    {
        return KyberNetworkProxyInterface(proxy);
    }

    function getInternalExpectedRate(
        IERC20 _sourceToken,
        IERC20 _targetToken,
        uint256 _sourceAmount
    )
        internal
        view
        returns (bool isSupported, uint256 minRate, uint256 maxRate)
    {
        (minRate, maxRate) = getKyberNetworkProxy().getExpectedRate(
            _sourceToken,
            _targetToken,
            _sourceAmount
        );
        isSupported = isSupportedRate(minRate, maxRate);
    }

    function multiplyByDecimals(IERC20 _token, uint256 _amount)
        internal
        view
        returns (uint256)
    {
        uint256 decimals = ETH_DECIMALS; // By default ETH decimals.
        if (address(_token) != address(ETH_TOKEN_ADDRESS)) {
            decimals = ERC20Detailed(address(_token)).decimals();
        }
        return _amount.mul(TEN ** decimals);
    }

    /*
        Calculates rates based on a min/max unit rate and a target amount.
    */
    function calculateRates(
        IERC20 _sourceToken,
        IERC20 _targetToken,
        uint256 _minRate,
        uint256 _maxRate,
        uint256 _targetAmountWithDecimals
    ) internal view returns (uint256, uint256) {
        uint256 minSourceAmountOne = _targetAmountWithDecimals.div(_minRate);
        uint256 maxSourceAmountOne = _targetAmountWithDecimals.div(_maxRate);

        uint256 minRateMinSourceAmount;
        uint256 maxRateMinSourceAmount;
        (
            ,
            minRateMinSourceAmount,
            maxRateMinSourceAmount
        ) = getInternalExpectedRate(
            _sourceToken,
            _targetToken,
            minSourceAmountOne
        );

        if (!isSupportedRate(minRateMinSourceAmount, maxRateMinSourceAmount)) {
            return (minRateMinSourceAmount, maxRateMinSourceAmount);
        }

        uint256 minRateMaxSourceAmount;
        uint256 maxRateMaxSourceAmount;
        (
            ,
            minRateMaxSourceAmount,
            maxRateMaxSourceAmount
        ) = getInternalExpectedRate(
            _sourceToken,
            _targetToken,
            maxSourceAmountOne
        );
        if (!isSupportedRate(minRateMaxSourceAmount, maxRateMaxSourceAmount)) {
            return (minRateMaxSourceAmount, maxRateMaxSourceAmount);
        }

        uint256 minRateValue = minRateMinSourceAmount < minRateMaxSourceAmount
            ? minRateMinSourceAmount
            : minRateMaxSourceAmount;
        uint256 maxRateValue = maxRateMinSourceAmount > maxRateMaxSourceAmount
            ? maxRateMinSourceAmount
            : maxRateMaxSourceAmount;

        return (minRateValue, maxRateValue);
    }

    /**
        It gets the expected rate for swapping tokens. 

        Example:
        1 BAT => Rate: 0.01 DAI
        X BAT => Target amount: 10 DAI

        X = Target Amount * 1 / Rate
        X = 10 DAI * 1 / 0.01
        X = 1000 BAT
        1000 BAT => 10 DAI
     */
    function getExpectedRate(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 targetAmount
    )
        external
        view
        isValidAddress(address(sourceToken))
        isValidAddress(address(targetToken))
        returns (bool isSupported, uint256 minRate, uint256 maxRate)
    {
        require(targetAmount > 0, "Target amount is not gt 0.");

        (isSupported, minRate, maxRate) = getInternalExpectedRate(
            sourceToken,
            targetToken,
            multiplyByDecimals(sourceToken, ONE)
        );

        // It is used to avoid loss decimals in the final result when it calculates rate with source amount.
        // That's the reason why it is multiplied by source token decimals.
        uint256 targetAmountWithDecimals = multiplyByDecimals(
            sourceToken,
            targetAmount
        );

        if (isSupported) {
            (uint256 minRateValue, uint256 maxRateValue) = calculateRates(
                sourceToken,
                targetToken,
                minRate,
                maxRate,
                targetAmountWithDecimals
            );
            isSupported = isSupportedRate(minRateValue, maxRateValue);

            if (isSupported) {
                minRate = targetAmountWithDecimals.div(minRateValue);
                maxRate = targetAmountWithDecimals.div(maxRateValue);
            }
        }

        return (isSupported, minRate, maxRate);
    }

    /**
        @dev It gets the expected rates for the pair (source/target tokens).
        @dev It requires that the swapping is supported. if not, it throws a require error.
        @dev It returns the min/max expected rates of the target token.
     */
    function getExpectedRateIfSupported(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 sourceAmount
    ) internal view returns (uint256 minRate, uint256 maxRate) {
        uint256 minRateValue;
        uint256 maxRateValue;
        // Get expected rates for the swapping source/target tokens.
        (minRateValue, maxRateValue) = getKyberNetworkProxy().getExpectedRate(
            sourceToken,
            targetToken,
            sourceAmount
        );

        // Check whether the swapping is supported.
        require(
            isSupportedRate(minRateValue, maxRateValue),
            "Swapping not supported. Verify source/target amount."
        );
        return (minRateValue, maxRateValue);
    }

    function swapToken(StablePayCommon.Order calldata _order)
        external
        isStablePay(msg.sender)
        isValidAddress(_order.toAddress)
        returns (bool)
    {
        require(_order.sourceAmount > 0, "Source amount must be gt 0");

        // Gets the ERC20 source/target token instances.
        IERC20 sourceToken = IERC20(_order.sourceToken);
        IERC20 targetToken = IERC20(_order.targetToken);

        // Get expected rates if the swapping is supported.
        uint256 maxRate;
        (, maxRate) = getExpectedRateIfSupported(
            sourceToken,
            targetToken,
            _order.sourceAmount
        );

        // Check the current source token balance is higher (or equals) to the order source amount.
        uint256 sourceInitialTokenBalance = getTokenBalanceOf(
            _order.sourceToken
        );
        require(
            sourceInitialTokenBalance >= _order.sourceAmount,
            "Not enough tokens in balance."
        );

        // Set the spender's token allowance to order source amount.
        approveTokensTo(sourceToken, address(proxy), _order.sourceAmount);

        // Execute swap between the ERC20 token to ERC20 token.
        // The source token left is transferred to this contract (KyberSwappingProvider).
        // The source token left is transferred back to StablePay in the next step. See 'transferDiffTokensIfApplicable' function.
        getKyberNetworkProxy().trade(
            sourceToken,
            _order.sourceAmount,
            targetToken,
            msg.sender, // The target amount is transferred to the sender (StablePay --see modifier isStablePay) directly.
            _order.targetAmount,
            maxRate,
            feeAddress
        );

        // Resetting the token approval back to zero.
        approveTokensTo(sourceToken, address(proxy), 0);

        // Get source token balance after swapping execution.
        uint256 sourceFinalTokenBalance = getTokenBalanceOf(_order.sourceToken);

        // Transfer diff (initial - final) source token balance to the sender.
        // The initial balance is higher (or equals) than final source token balance.
        transferDiffTokensIfApplicable(
            _order.sourceToken,
            msg.sender, // The sender address (StablePay) will receive the source tokens left.
            _order.sourceAmount,
            sourceInitialTokenBalance,
            sourceFinalTokenBalance
        );

        return true;
    }

    function swapEther(StablePayCommon.Order calldata _order)
        external
        payable
        isStablePay(msg.sender)
        returns (bool)
    {
        require(msg.value > 0, "Msg value must be gt 0");
        require(_order.sourceAmount > 0, "Amount must be gt 0");
        require(msg.value == _order.sourceAmount, "Msg value is not eq source amount");
        require(_order.toAddress != address(0x0), "To address must be not eq 0x0.");

        // Gets the ERC20 source/target token instances.
        IERC20 sourceToken = IERC20(_order.sourceToken);
        IERC20 targetToken = IERC20(_order.targetToken);

        // Get expected rates if the swapping is supported.
        uint256 minRate;
        uint256 maxRate;
        (minRate, maxRate) = getExpectedRateIfSupported(
            sourceToken,
            targetToken,
            _order.sourceAmount
        );

        // Get ether balance before swapping execution, and validate it is higher (or equals) to order source amount.
        uint256 sourceInitialEtherBalance = getEtherBalance();
        require(
            sourceInitialEtherBalance >= _order.sourceAmount,
            "Not enough ether in balance."
        );

        // Execute the swapping from ETH to ERC20 token.
        // The Ether left is transferred to this (KyberSwappingProvider) contract.
        // So, the fallback function in the AbstractSwappingProvider contract is executed.
        // Then this contract transfers the Ether left in the next step calling the 'transferDiffEtherBalanceIfApplicable' function.
        getKyberNetworkProxy().trade.value(msg.value)(
            sourceToken,
            _order.sourceAmount,
            targetToken,
            msg.sender, // The target amount is transferred to this address (StablePay) directly.
            _order.targetAmount,
            maxRate,
            feeAddress
        );

        // Get ether balance after swapping execution.
        uint256 sourceFinalEtherBalance = getEtherBalance();

        // Transfer back to the sender the diff balance (Ether).
        transferDiffEtherBalanceIfApplicable(
            _order.fromAddress,
            msg.value,
            sourceInitialEtherBalance,
            sourceFinalEtherBalance
        );

        return true;
    }
}
