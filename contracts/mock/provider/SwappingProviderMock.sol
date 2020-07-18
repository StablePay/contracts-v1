pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../../providers/AbstractSwappingProvider.sol";

contract SwappingProviderMock is AbstractSwappingProvider {
    /** Fields */
    bool public isSupported;
    uint256 public minRate;
    uint256 public maxRate;

    address public sourceToken;
    address public targetToken;

    uint256 public plusSourceAmount = 0;
    uint256 public plusTargetAmount = 0;

    /** Constructor */

    constructor(address stablePay) public AbstractSwappingProvider(stablePay) {}

    /** Functions */

    function setPlusAmounts(uint256 _plusSourceAmount, uint256 _plusTargetAmount)
        public
        returns (bool)
    {
        plusSourceAmount = _plusSourceAmount;
        plusTargetAmount = _plusTargetAmount;
        return true;
    }

    function setTokens(address _sourceToken, address _targetToken) public returns (bool) {
        sourceToken = _sourceToken;
        targetToken = _targetToken;
        return true;
    }

    function setRates(
        bool _isSupported,
        uint256 _minRate,
        uint256 _maxRate
    ) public returns (bool) {
        isSupported = _isSupported;
        minRate = _minRate;
        maxRate = _maxRate;
        return true;
    }

    function swapToken(StablePayCommon.Order calldata _order) external returns (bool) {
        bool targetTransferResult = IERC20(_order.targetToken).transfer(
            msg.sender,
            _order.targetAmount
        );
        require(targetTransferResult, "Target token transfer not valid.");

        return true;
    }

    function swapEther(StablePayCommon.Order calldata order)
        external
        payable
        returns (bool)
    {
        order;
        return true;
    }

    function getExpectedRate(
        IERC20 src,
        IERC20 dest,
        uint256 srcQty
    )
        external
        view
        returns (
            bool _isSupported,
            uint256 _minRate,
            uint256 _maxRate
        )
    {
        src;
        dest;
        srcQty;
        return (isSupported, minRate, maxRate);
    }
}
