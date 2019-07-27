pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../erc20/ERC20.sol";
import "../kyber/KyberNetworkProxyInterface.sol";
import "../util/StablePayCommon.sol";
import "./ISwappingProvider.sol";

/**
    https://developer.kyber.network/docs/VendorsGuide/#converting-from-erc20
    https://developer.kyber.network/docs/KyberNetworkProxy/#getexpectedrate
 */
contract KyberSwappingProvider is ISwappingProvider {

    ERC20 constant internal ETH_TOKEN_ADDRESS = ERC20(0x00eeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee);
    uint constant internal ONE = 1;
    uint constant internal TEN = 10;
    uint constant internal ETH_DECIMALS = 18;
    address public proxy;
    address public feeAddress;

    /** Events */

    /** Modifiers */

    modifier isValidAddress(address _anAddress) {
        require(_anAddress != address(0x0), "Address must not be empty.");
        _;
    }

    /** Constructor */

    constructor(address _stablePay, address _proxy, address _feeAddress)
        public ISwappingProvider(_stablePay) {
        proxy = _proxy;
        feeAddress = _feeAddress;
    }

    /** Methods */

    function isSupportedRate(uint _minRate, uint _maxRate)
    internal
    pure
    returns (bool) {
        return _minRate > 0 && _maxRate > 0;
    }

    function getKyberNetworkProxy()
    internal
    view
    returns (KyberNetworkProxyInterface) {
        return KyberNetworkProxyInterface(proxy);
    }

    function getInternalExpectedRate(ERC20 _sourceToken, ERC20 _targetToken, uint _sourceAmount)
    internal
    view
    returns (bool isSupported, uint minRate, uint maxRate)
    {
        (minRate, maxRate) = getKyberNetworkProxy().getExpectedRate(_sourceToken, _targetToken, _sourceAmount);
        isSupported = isSupportedRate(minRate, maxRate);
    }

    function multiplyByDecimals(ERC20 _token, uint _amount)
    internal
    view
    returns (uint) {
        uint decimals = ETH_DECIMALS; // By default ETH decimals.
        if(address(_token) != address(ETH_TOKEN_ADDRESS)) {
            decimals = _token.decimals();
        }
        return _amount.mul(TEN ** decimals);
    }

    /*
        Calculates rates based on a min/max unit rate and a target amount.
    */
    function calculateRates(ERC20 _sourceToken, ERC20 _targetToken, uint _minRate, uint _maxRate, uint _targetAmountWithDecimals)
    internal
    view
    returns (uint, uint) {
        uint minSourceAmountOne = _targetAmountWithDecimals.div(_minRate);
        uint maxSourceAmountOne = _targetAmountWithDecimals.div(_maxRate);

        uint minRateMinSourceAmount;
        uint maxRateMinSourceAmount;
        (, minRateMinSourceAmount, maxRateMinSourceAmount) = getInternalExpectedRate(_sourceToken, _targetToken, minSourceAmountOne);

        if(!isSupportedRate(minRateMinSourceAmount, maxRateMinSourceAmount)) {
            return (minRateMinSourceAmount, maxRateMinSourceAmount);
        }

        uint minRateMaxSourceAmount;
        uint maxRateMaxSourceAmount;
        (, minRateMaxSourceAmount, maxRateMaxSourceAmount) = getInternalExpectedRate(_sourceToken, _targetToken, maxSourceAmountOne);
        if(!isSupportedRate(minRateMaxSourceAmount, maxRateMaxSourceAmount)) {
            return (minRateMaxSourceAmount, maxRateMaxSourceAmount);
        }

        uint minRateValue = minRateMinSourceAmount < minRateMaxSourceAmount ? minRateMinSourceAmount : minRateMaxSourceAmount;
        uint maxRateValue = maxRateMinSourceAmount > maxRateMaxSourceAmount ? maxRateMinSourceAmount : maxRateMaxSourceAmount;

        return (
            minRateValue,
            maxRateValue
        );
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
    function getExpectedRate(ERC20 _sourceToken, ERC20 _targetToken, uint _targetAmount)
    public
    view
    isValidAddress(address(_sourceToken))
    isValidAddress(address(_targetToken))
    returns (bool isSupported, uint minRate, uint maxRate)
    {
        require(_targetAmount > 0, "Target amount > 0.");

        (isSupported, minRate, maxRate) = getInternalExpectedRate(_sourceToken, _targetToken, multiplyByDecimals(_sourceToken, ONE));

        // It is used to avoid loss decimals in the final result when it calculates rate with source amount.
        // That's the reason why it is multiplied by source token decimals.
        uint targetAmountWithDecimals = multiplyByDecimals(_sourceToken, _targetAmount);

        if( isSupported ) {
            (uint minRateValue, uint maxRateValue) = calculateRates(_sourceToken, _targetToken, minRate, maxRate, targetAmountWithDecimals);
            isSupported = isSupportedRate(minRateValue, maxRateValue);

            if(isSupported) {
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
    function getExpectedRateIfSupported(ERC20 _sourceToken, ERC20 _targetToken, uint sourceAmount)
    internal
    view
    returns (uint minRate, uint maxRate)
    {
        uint minRateValue;
        uint maxRateValue;
        // Get expected rates for the swapping source/target tokens.
        (minRateValue, maxRateValue) = getKyberNetworkProxy().getExpectedRate(_sourceToken, _targetToken, sourceAmount);
        
        // Check whether the swapping is supported.
        require(isSupportedRate(minRateValue, maxRateValue), "Swapping not supported. Verify source/target amount.");
        return (minRateValue, maxRateValue);
    }

    function swapToken(StablePayCommon.Order memory _order)
    public
    isStablePay(msg.sender)
    isValidAddress(_order.toAddress)
    returns (bool)
    {
        require(_order.sourceAmount > 0, "Source amount must be > 0");

        // Gets the ERC20 source/target token instances.
        ERC20 sourceToken = ERC20(_order.sourceToken);
        ERC20 targetToken = ERC20(_order.targetToken);

        // Get expected rates if the swapping is supported.
        uint minRate;
        uint maxRate;
        (minRate, maxRate) = getExpectedRateIfSupported(sourceToken, targetToken, _order.sourceAmount);

        // Check the current source token balance is higher (or equals) to the order source amount.
        uint256 sourceInitialTokenBalance = getTokenBalanceOf(_order.sourceToken);
        require(sourceInitialTokenBalance >= _order.sourceAmount, "Not enough tokens in balance.");

        // Set the spender's token allowance to tokenQty
        approveTokensTo(sourceToken, address(proxy), _order.sourceAmount);

        // Execute swap between the ERC20 token to ERC20 token.
        getKyberNetworkProxy().trade(
            sourceToken,
            _order.sourceAmount,
            targetToken,
            msg.sender, // Kyber will call sender fallback function to transfer back the ether left.
            _order.targetAmount,
            maxRate,
            feeAddress
        );

        // Get source token balance after swapping execution.
        uint256 sourceFinalTokenBalance = getTokenBalanceOf(_order.sourceToken);

        // Transfer diff (initial - final) source token balance to the sender.
        // The initial balance is higher (or equals) than final source token balance.
        transferDiffTokensIfApplicable(_order.sourceToken, msg.sender, _order.sourceAmount, sourceInitialTokenBalance, sourceFinalTokenBalance);

        return true;
    }

    function swapEther(StablePayCommon.Order memory _order)
    public
    payable
    isStablePay(msg.sender)
    returns (bool)
    {
        require(msg.value > 0, "Msg value must be > 0");
        require(_order.sourceAmount > 0, "Amount must be > 0");
        require(msg.value == _order.sourceAmount, "Msg value == source amount");
        require(_order.toAddress != address(0x0), "To address must be != 0x0.");

        // Gets the ERC20 source/target token instances.
        ERC20 sourceToken = ERC20(_order.sourceToken);
        ERC20 targetToken = ERC20(_order.targetToken);

        // Get expected rates if the swapping is supported.
        uint minRate;
        uint maxRate;
        (minRate, maxRate) = getExpectedRateIfSupported(sourceToken, targetToken, _order.sourceAmount);

        // Get ether balance before swapping execution, and validate it is higher (or equals) to order source amount.
        uint256 sourceInitialEtherBalance = getEtherBalance();
        require(sourceInitialEtherBalance >= _order.sourceAmount, "Not enough ether in balance.");

        // Execute the swapping from ERC20 token to ETH.
        getKyberNetworkProxy().trade.value(msg.value)(
            sourceToken,
            _order.sourceAmount,
            targetToken,
            msg.sender,
            _order.targetAmount,
            maxRate,
            feeAddress
        );

        // Get ether balance after swapping execution.
        uint256 sourceFinalEtherBalance = getEtherBalance();

        // Transfer back to the sender the diff balance (Ether).
        transferDiffEtherBalanceIfApplicable(_order.fromAddress, msg.value, sourceInitialEtherBalance, sourceFinalEtherBalance);

        return true;
    }
}