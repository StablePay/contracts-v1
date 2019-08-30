pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../../providers/AbstractSwappingProvider.sol";

contract CustomSwappingProviderMock is AbstractSwappingProvider {
    /** Properties */
    bool public _swapResult = true;
    uint256 public _minRate;
    uint256 public _maxRate;
    bool public _isSupported = true;

    /** Events */

    /** Modifiers */

    /** Constructor */

    constructor(address stablePay) public AbstractSwappingProvider(stablePay) {}

    /** Methods */

    function setExpectedRate(bool isSupported, uint256 minRate, uint256 maxRate)
        public
    {
        _minRate = minRate;
        _maxRate = maxRate;
        _isSupported = isSupported;
    }

    function swapToken(StablePayCommon.Order calldata order)
        external
        returns (bool)
    {
        order;
        return _swapResult;
    }

    function swapEther(StablePayCommon.Order calldata order)
        external
        payable
        returns (bool)
    {
        order;
        return _swapResult;
    }

    function getExpectedRate(IERC20 sourceToken, IERC20 targetToken, uint256 targetAmount)
        external
        view
        returns (bool isSupported, uint256 minRate, uint256 maxRate)
    {
        sourceToken;
        targetToken;
        targetAmount;
        return (_isSupported, _minRate, _maxRate);
    }

    function deposit() public payable returns (bool) {
        return true;
    }

    function stablePayNonPayable() internal view returns (address payable) {
        return address(uint160(stablePay));
    }

    function _transferDiffEtherBalanceIfApplicable(
        address payable to,
        uint256 transferAmount
    ) public payable returns (bool) {
        uint256 initialBalance = getEtherBalance();
        stablePayNonPayable().transfer(transferAmount);
        uint256 finalBalance = getEtherBalance();
        return
            super.transferDiffEtherBalanceIfApplicable(
                to,
                msg.value,
                initialBalance,
                finalBalance
            );
    }

    function _calculateDiffBalance(
        uint256 sentAmount,
        uint256 initialBalance,
        uint256 finalBalance
    ) public pure returns (uint256) {
        return
            super.calculateDiffBalance(
                sentAmount,
                initialBalance,
                finalBalance
            );
    }

}
