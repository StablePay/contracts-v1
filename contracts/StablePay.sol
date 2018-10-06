pragma solidity 0.4.24;
pragma experimental ABIEncoderV2;


import "./erc20/ERC20.sol";
import "./0x/interfaces/IExchange.sol";
import "./0x/interfaces/IAssetProxy.sol";
import "./0x/libs/LibOrder.sol";
import "./0x/libs/LibFillResults.sol";
import "./erc20/WETH9.sol";

/**
    @dev Stable Pay smart contract.
 */
contract StablePay {

    address public assetProxy;
    address public exchange;
    address public wethErc20;

    /**** Events ***********/

    /*** Modifiers ***************/

    /*** Constructor ***************/

    constructor(address _assetProxy, address _exchange, address _wethErc20) public {
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

    function payToken(
        LibOrder.Order _order,
        address _fromErc20,
        address _destErc20,
        address _seller,
        uint256 _amount,
        bytes _signature
    )
    public
    returns (bool)
    {
        // Check if this contract has enough balance.
        checkAllowance(_fromErc20, msg.sender, _amount);
        
        // Transfer the tokens from seller to this contract.
        transferFromPayer(_fromErc20, msg.sender, _amount);
        
        // Allow Exchange to the transfer amount.
        ERC20(_fromErc20).approve(assetProxy, _amount);

        // Call fillOrder function in the IExchange instance.
        LibFillResults.FillResults memory fillResults = IExchange(exchange).fillOrder(
            _order,
            _amount,
            _signature
        );

        ERC20(_destErc20).transfer(_seller, fillResults.makerAssetFilledAmount);

        return true;
    }



    function payETH(
        //LibOrder.Order _order,
       // address _fromErc20,
        address _destErc20,
        address _seller,
        uint256 _amount,
        bytes _signature
    )
    public payable
    returns (bool)
    {

        WETH9 weth = WETH9(wethErc20);
        // deposit eth to weth
        weth.deposit.value(msg.value)();

       /* // Check if this contract has enough balance.
        checkAllowance(_fromErc20, msg.sender, _amount);

        // Transfer the tokens from seller to this contract.
        transferFromPayer(_fromErc20, msg.sender, _amount);

        // Allow Exchange to the transfer amount.
        ERC20(_fromErc20).approve(assetProxy, _amount);

        // Call fillOrder function in the IExchange instance.
        LibFillResults.FillResults memory fillResults = IExchange(exchange).fillOrder(
            _order,
            _amount,
            _signature
        );

        ERC20(_destErc20).transfer(_seller, fillResults.makerAssetFilledAmount);*/

        return true;
    }
}