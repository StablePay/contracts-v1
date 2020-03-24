

pragma solidity 0.5.10;

pragma experimental ABIEncoderV2;

import "@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol";

import "../util/StablePayCommon.sol";

import "./AbstractSwappingProvider.sol";

/**

    @title DEX AG Swapping provider

    @author StablePay <doug@stablepay.io>

    @notice  https://docs.dex.ag/proxy-contract/contract-fillable-liquidity

    @notice 

 */

contract DexAgSwappingProvider is AbstractSwappingProvider {

    /** Constants */

    bytes constant EMPTY = "";

    /** Properties */

    address payable public proxy;

    /** Events */

    /** Modifiers */

    modifier isValidToAddress(address _anAddress) {

        require(_anAddress != address(0x0), "To Address must not be 0x0.");

        _;

    }

    modifier hasValidCallData(bytes memory _callData) {

        require(keccak256(_callData) != keccak256(EMPTY), "CallData is empty.");

        _;

    }

    /** Constructor */

    constructor(address stablePayAddress, address payable _proxy)

        public

        AbstractSwappingProvider(stablePayAddress)

    {

        proxy = _proxy;

    }

    /** Methods */

    // NOTE: this can be overriden for other dexes

    function getProxy()

        internal

        view

        returns (address)

    {

        return proxy;

    }

    function swapToken(StablePayCommon.Order memory _order)

        public

        isStablePay(msg.sender)

        isValidToAddress(_order.toAddress)

        hasValidCallData(_order.data)

        returns (bool)

    {

        require(_order.sourceAmount > 0, "Source amount must be > 0");

        // Gets the ERC20 source/target token instances.

        ERC20Detailed sourceToken = ERC20Detailed(_order.sourceToken);

        // Check the current source token balance is higher (or equals) to the order source amount.

        uint256 sourceInitialTokenBalance = getTokenBalanceOf(

            _order.sourceToken

        );

        require(

            sourceInitialTokenBalance >= _order.sourceAmount,

            "Not enough tokens in balance."

        );

        // Set the spender's token allowance to tokenQty

        approveTokensTo(sourceToken, getProxy(), _order.sourceAmount);

        // Execute swap between the ERC20 token to ERC20 token.

        makeCallData(_order);

        // Get source token balance after swapping execution.

        uint256 sourceFinalTokenBalance = getTokenBalanceOf(_order.sourceToken);

        // Transfer diff (initial - final) source token balance to the sender.

        // The initial balance is higher (or equals) than final source token balance.

        transferDiffTokensIfApplicable(

            _order.sourceToken,

            msg.sender,

            _order.sourceAmount,

            sourceInitialTokenBalance,

            sourceFinalTokenBalance

        );

        return true;

    }

    function swapEther(StablePayCommon.Order memory _order)

        public

        payable

        isStablePay(msg.sender)

        isValidToAddress(_order.toAddress)

        hasValidCallData(_order.data)

        returns (bool)

    {

        require(msg.value > 0, "Msg value must be > 0");

        require(_order.sourceAmount > 0, "Amount must be > 0");

        require(msg.value == _order.sourceAmount, "Msg value == source amount");

        // Get ether balance before swapping execution, and validate it is higher (or equals) to order source amount.

        uint256 sourceInitialEtherBalance = getEtherBalance();

        require(

            sourceInitialEtherBalance >= _order.sourceAmount,

            "Not enough ether in balance."

        );

        makeCallData(_order);

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

    function makeCallData(StablePayCommon.Order memory _order)

        internal

    {

        //(bool success, ) = proxy.call.gas(gasValue).value(msg.value)(_order.data);

        (bool success, ) = proxy.call.value(msg.value)(_order.data);

        require(success, "DexAg proxy call failed.");

    }

}

