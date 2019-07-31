pragma solidity 0.5.3;
pragma experimental ABIEncoderV2;

import "../../services/erc20/ERC20.sol";
import "../../providers/ISwappingProvider.sol";

contract SwappingProviderMock is ISwappingProvider {
    /** Fields */
    bool public isSupported;
    uint256 public minRate;
    uint256 public maxRate;

    address public sourceToken;
    address public targetToken;

    uint256 public plusSourceAmount = 0;
    uint256 public plusTargetAmount = 0;

    /** Constructor */

    constructor(address stablePay) public ISwappingProvider(stablePay) {}

    /** Functions */

    function setPlusAmounts(
        uint256 _plusSourceAmount,
        uint256 _plusTargetAmount
    ) public returns (bool) {
        plusSourceAmount = _plusSourceAmount;
        plusTargetAmount = _plusTargetAmount;
        return true;
    }

    function setTokens(address _sourceToken, address _targetToken)
        public
        returns (bool)
    {
        sourceToken = _sourceToken;
        targetToken = _targetToken;
        return true;
    }

    function setRates(bool _isSupported, uint256 _minRate, uint256 _maxRate)
        public
        returns (bool)
    {
        isSupported = _isSupported;
        minRate = _minRate;
        maxRate = _maxRate;
        return true;
    }

    function swapToken(StablePayCommon.Order memory _order)
        public
        returns (bool)
    {
        bool targetTransferResult = ERC20(_order.targetToken).transfer(
            msg.sender,
            _order.targetAmount
        );
        require(targetTransferResult, "Target token transfer not valid.");

        return true;
    }

    function swapEther(StablePayCommon.Order memory order)
        public
        payable
        returns (bool)
    {
        order;
        return true;
    }

    function getExpectedRate(ERC20 src, ERC20 dest, uint256 srcQty)
        public
        view
        returns (bool _isSupported, uint256 _minRate, uint256 _maxRate)
    {
        src;
        dest;
        srcQty;
        return (isSupported, minRate, maxRate);
    }

}
