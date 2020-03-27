pragma solidity 0.5.10;
pragma experimental ABIEncoderV2;

import "../../providers/DexAgSwappingProvider.sol";

contract DexAgSwappingProviderMock is DexAgSwappingProvider {
    constructor(address stablePay, address proxy)
        public
        DexAgSwappingProvider(stablePay, proxy)
    {}

    function _isSupportedRate(uint256 minRate, uint256 maxRate)
        public
        pure
        returns (bool)
    {
        return isSupportedRate(minRate, maxRate);
    }

    function _multiplyByDecimals(IERC20 token, uint256 amount)
        public
        view
        returns (uint256)
    {
        return multiplyByDecimals(token, amount);
    }

    function _getInternalExpectedRate(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 sourceAmount
    )
        internal
        view
        returns (bool isSupported, uint256 minRate, uint256 maxRate)
    {
        return getInternalExpectedRate(sourceToken, targetToken, sourceAmount);
    }

    function _getExpectedRateIfSupported(
        IERC20 sourceToken,
        IERC20 targetToken,
        uint256 sourceAmount
    ) public view returns (uint256 minRate, uint256 maxRate) {
        return
            getExpectedRateIfSupported(sourceToken, targetToken, sourceAmount);
    }
}
