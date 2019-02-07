pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../util/StablePayCommon.sol";
import "./ISwappingProvider.sol";
import "../erc20/ERC20.sol";
import "../0x/interfaces/IExchange.sol";
import "../0x/interfaces/IAssetProxy.sol";
import "../0x/libs/LibOrder.sol";
import "../0x/libs/LibFillResults.sol";
import "../erc20/WETH9.sol";

contract ZeroxSwappingProvider is ISwappingProvider {

    address public assetProxy;
    address public exchange;
    address public wethErc20;

    /**** Events ***********/

    /*** Modifiers ***************/

    /*** Constructor ***************/

    constructor(address _stablePay, address _assetProxy, address _exchange, address _wethErc20)
        public ISwappingProvider(_stablePay) {
        assetProxy = _assetProxy;
        exchange = _exchange;
        wethErc20 = _wethErc20;
    }

    /*** Fallback Method ***************/

    function () public payable {}

    /*** Methods ***************/

    function checkAllowance(
        address _erc20,
        address _payer,
        uint256 _amount
    )
    internal
    view
    returns (bool)
    {
        ERC20 token = ERC20(_erc20);
        uint256 thisErc20Balance = token.allowance(_payer, address(this));
        require(thisErc20Balance >= _amount, "Not enough allowed tokens.");
        return true;
    }

    /**
       @dev It transfers tokens from the seller to this contract.
       @dev it  assumes allowance has been done.
    */
    function transferFromPayer(
        address _erc20,
        address _payer,
        uint256 _amount
    )

    internal
    returns (bool) {
        ERC20 token = ERC20(_erc20);
        bool transferResult = token.transferFrom(
            _payer,
            address(this),
            _amount
        );
        require(transferResult, "Transfer from ERC20 failed.");
        return true;
    }


    function swapToken(StablePayCommon.Order _order)
    public
    returns (bool) {
        // Check if this contract has enough balance.
        checkAllowance(
            _order.sourceToken,
            msg.sender,
            _order.sourceAmount
        );
        
        // Transfer the tokens from seller to this contract.
        transferFromPayer(
            _order.sourceToken,
            msg.sender,
            _order.sourceAmount
        );
        
        // Allow Exchange to the transfer amount.
        ERC20(_order.sourceToken).approve(assetProxy, _order.sourceAmount);

        // Call fillOrder function in the IExchange instance.
        LibOrder.Order memory _zeroxOrder = LibOrder.Order({
            makerAddress: _order.makerAddress,
            takerAddress: _order.takerAddress,
            feeRecipientAddress: _order.feeRecipientAddress,
            senderAddress: _order.senderAddress,
            makerAssetAmount: _order.makerAssetAmount,
            takerAssetAmount: _order.takerAssetAmount,
            makerFee: _order.makerFee,
            takerFee: _order.takerFee,
            expirationTimeSeconds: _order.expirationTimeSeconds,
            salt: _order.salt,
            makerAssetData: _order.makerAssetData,
            takerAssetData: _order.takerAssetData
        });
        LibFillResults.FillResults memory fillResults = IExchange(exchange).fillOrder(
            _zeroxOrder,
            _order.sourceAmount,
            _order.signature
        );

        ERC20(_order.targetToken).transfer(
            _order.merchantAddress,
            fillResults.makerAssetFilledAmount
        );

        return true;
    }

    function payEther(StablePayCommon.Order _order)
    public
    payable
    returns (bool)
    {
        WETH9 weth = WETH9(wethErc20);
        // deposit eth to weth
        weth.deposit.value(msg.value)();

        //now we have the weth continue with transaction

        // Check if this contract has enough balance.
        require(weth.balanceOf(address(this)) >= _order.sourceAmount);

        // Allow Exchange to the transfer amount.
        weth.approve(assetProxy, _order.sourceAmount);

        // Call fillOrder function in the IExchange instance.
        LibOrder.Order memory _zeroxOrder = LibOrder.Order({
            makerAddress: _order.makerAddress,
            takerAddress: _order.takerAddress,
            feeRecipientAddress: _order.feeRecipientAddress,
            senderAddress: _order.senderAddress,
            makerAssetAmount: _order.makerAssetAmount,
            takerAssetAmount: _order.takerAssetAmount,
            makerFee: _order.makerFee,
            takerFee: _order.takerFee,
            expirationTimeSeconds: _order.expirationTimeSeconds,
            salt: _order.salt,
            makerAssetData: _order.makerAssetData,
            takerAssetData: _order.takerAssetData
        });
        LibFillResults.FillResults memory fillResults = IExchange(exchange).fillOrder(
            _zeroxOrder,
            _order.sourceAmount,
            _order.signature
        );

        ERC20(_order.targetToken).transfer(
            _order.merchantAddress,
            fillResults.makerAssetFilledAmount
        );

        return true;
    }

    function swapEther(StablePayCommon.Order _order)
    public
    payable
    returns (bool)
    {
        WETH9 weth = WETH9(wethErc20);
        // deposit eth to weth
        weth.deposit.value(msg.value)();

        //now we have the weth continue with transaction

        // Check if this contract has enough balance.
        require(weth.balanceOf(address(this)) >= _order.sourceAmount);

        // Allow Exchange to the transfer amount.
        weth.approve(assetProxy, _order.sourceAmount);

        // Call fillOrder function in the IExchange instance.
        LibOrder.Order memory _zeroxOrder = LibOrder.Order({
            makerAddress: _order.makerAddress,
            takerAddress: _order.takerAddress,
            feeRecipientAddress: _order.feeRecipientAddress,
            senderAddress: _order.senderAddress,
            makerAssetAmount: _order.makerAssetAmount,
            takerAssetAmount: _order.takerAssetAmount,
            makerFee: _order.makerFee,
            takerFee: _order.takerFee,
            expirationTimeSeconds: _order.expirationTimeSeconds,
            salt: _order.salt,
            makerAssetData: _order.makerAssetData,
            takerAssetData: _order.takerAssetData
        });
        LibFillResults.FillResults memory fillResults = IExchange(exchange).fillOrder(
            _zeroxOrder,
            _order.sourceAmount,
            _order.signature
        );

        ERC20(_order.targetToken).transfer(
            _order.merchantAddress,
            fillResults.makerAssetFilledAmount
        );

        return true;
    }

    function getExpectedRate(ERC20 _sourceToken, ERC20 _targetToken, uint _amount) public view returns (uint, uint) {
        return (0, 0);
    }
}