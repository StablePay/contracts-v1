pragma solidity 0.5.10;

import "../../services/uniswap/UniswapExchangeInterface.sol";

contract CustomUniswapExchangeMock is UniswapExchangeInterface {
    uint256 public ethToTokenInput;
    uint256 public ethToTokenOutput;
    uint256 public tokenToEthInput;
    uint256 public tokenToEthOutput;
    address public token;

    constructor(
        uint256 _ethToTokenInput,
        uint256 _ethToTokenOutput,
        uint256 _tokenToEthInput,
        uint256 _tokenToEthOutput
    ) public {
        ethToTokenInput = _ethToTokenInput;
        ethToTokenOutput = _ethToTokenOutput;
        tokenToEthInput = _tokenToEthInput;
        tokenToEthOutput = _tokenToEthOutput;
    }

    // Address of ERC20 token sold on this exchange
    function tokenAddress() external view returns (address) {
        return token;
    }

    // Address of Uniswap Factory
    function factoryAddress() external view returns (address factory) {
        return address(0x0);
    }

    // Provide Liquidity
    function addLiquidity(
        uint256 min_liquidity,
        uint256 max_tokens,
        uint256 deadline
    ) external payable returns (uint256) {
        min_liquidity;
        max_tokens;
        deadline;
        return msg.value;
    }

    function removeLiquidity(
        uint256 amount,
        uint256 min_eth,
        uint256 min_tokens,
        uint256 deadline
    ) external returns (uint256, uint256) {
        min_tokens;
        deadline;
        return (amount, min_eth);
    }

    // Get Prices
    function getEthToTokenInputPrice(uint256 eth_sold)
        external
        view
        returns (uint256 tokens_bought)
    {
        return eth_sold;
    }

    function getEthToTokenOutputPrice(uint256 tokens_bought)
        external
        view
        returns (uint256 eth_sold)
    {
        tokens_bought;
        return ethToTokenOutput;
    }

    function getTokenToEthInputPrice(uint256 tokens_sold)
        external
        view
        returns (uint256 eth_bought)
    {
        tokens_sold;
        return tokenToEthInput;
    }

    function getTokenToEthOutputPrice(uint256 eth_bought)
        external
        view
        returns (uint256 tokens_sold)
    {
        eth_bought;
        return tokenToEthOutput;
    }

    // Trade ETH to ERC20
    function ethToTokenSwapInput(uint256 min_tokens, uint256 deadline)
        external
        payable
        returns (uint256 tokens_bought)
    {
        min_tokens;
        deadline;
        return msg.value;
    }

    function ethToTokenTransferInput(
        uint256 min_tokens,
        uint256 deadline,
        address recipient
    ) external payable returns (uint256 tokens_bought) {
        deadline;
        recipient;
        return min_tokens;
    }

    function ethToTokenSwapOutput(uint256 tokens_bought, uint256 deadline)
        external
        payable
        returns (uint256 eth_sold)
    {
        deadline;
        return tokens_bought;
    }

    function ethToTokenTransferOutput(
        uint256 tokens_bought,
        uint256 deadline,
        address recipient
    ) external payable returns (uint256 eth_sold) {
        deadline;
        recipient;
        return tokens_bought;
    }

    // Trade ERC20 to ETH
    function tokenToEthSwapInput(
        uint256 tokens_sold,
        uint256 min_eth,
        uint256 deadline
    ) external returns (uint256 eth_bought) {
        min_eth;
        deadline;
        return tokens_sold;
    }

    function tokenToEthTransferInput(
        uint256 tokens_sold,
        uint256 min_tokens,
        uint256 deadline,
        address recipient
    ) external returns (uint256 eth_bought) {
        min_tokens;
        deadline;
        recipient;
        return tokens_sold;
    }

    function tokenToEthSwapOutput(
        uint256 eth_bought,
        uint256 max_tokens,
        uint256 deadline
    ) external returns (uint256 tokens_sold) {
        max_tokens;
        deadline;
        return eth_bought;
    }

    function tokenToEthTransferOutput(
        uint256 eth_bought,
        uint256 max_tokens,
        uint256 deadline,
        address recipient
    ) external returns (uint256 tokens_sold) {
        max_tokens;
        deadline;
        recipient;
        return eth_bought;
    }

    // Trade ERC20 to ERC20
    function tokenToTokenSwapInput(
        uint256 tokens_sold,
        uint256 min_tokens_bought,
        uint256 min_eth_bought,
        uint256 deadline,
        address token_addr
    ) external returns (uint256 tokens_bought) {
        min_tokens_bought;
        min_eth_bought;
        deadline;
        token_addr;
        return tokens_sold;
    }

    function tokenToTokenTransferInput(
        uint256 tokens_sold,
        uint256 min_tokens_bought,
        uint256 min_eth_bought,
        uint256 deadline,
        address recipient,
        address token_addr
    ) external returns (uint256 tokens_bought) {
        min_tokens_bought;
        min_eth_bought;
        deadline;
        recipient;
        token_addr;
        return tokens_sold;
    }

    function tokenToTokenSwapOutput(
        uint256 tokens_bought,
        uint256 max_tokens_sold,
        uint256 max_eth_sold,
        uint256 deadline,
        address token_addr
    ) external returns (uint256 tokens_sold) {
        max_tokens_sold;
        max_eth_sold;
        deadline;
        token_addr;
        return tokens_bought;
    }

    function tokenToTokenTransferOutput(
        uint256 tokens_bought,
        uint256 max_tokens_sold,
        uint256 max_eth_sold,
        uint256 deadline,
        address recipient,
        address token_addr
    ) external returns (uint256 tokens_sold) {
        max_tokens_sold;
        max_eth_sold;
        deadline;
        recipient;
        token_addr;
        return tokens_bought;
    }

    // Trade ERC20 to Custom Pool
    function tokenToExchangeSwapInput(
        uint256 tokens_sold,
        uint256 min_tokens_bought,
        uint256 min_eth_bought,
        uint256 deadline,
        address exchange_addr
    ) external returns (uint256 tokens_bought) {
        min_tokens_bought;
        min_eth_bought;
        deadline;
        exchange_addr;
        return tokens_sold;
    }

    function tokenToExchangeTransferInput(
        uint256 tokens_sold,
        uint256 min_tokens_bought,
        uint256 min_eth_bought,
        uint256 deadline,
        address recipient,
        address exchange_addr
    ) external returns (uint256 tokens_bought) {
        min_tokens_bought;
        min_eth_bought;
        deadline;
        recipient;
        exchange_addr;
        return tokens_sold;
    }

    function tokenToExchangeSwapOutput(
        uint256 tokens_bought,
        uint256 max_tokens_sold,
        uint256 max_eth_sold,
        uint256 deadline,
        address exchange_addr
    ) external returns (uint256 tokens_sold) {
        max_tokens_sold;
        max_eth_sold;
        deadline;
        exchange_addr;
        return tokens_bought;
    }

    function tokenToExchangeTransferOutput(
        uint256 tokens_bought,
        uint256 max_tokens_sold,
        uint256 max_eth_sold,
        uint256 deadline,
        address recipient,
        address exchange_addr
    ) external returns (uint256 tokens_sold) {
        max_tokens_sold;
        max_eth_sold;
        deadline;
        recipient;
        exchange_addr;
        return tokens_bought;
    }

    // ERC20 comaptibility for liquidity tokens
    bytes32 public name;
    bytes32 public symbol;
    uint256 public decimals;

    function transfer(address _to, uint256 _value) external returns (bool) {
        _to;
        _value;
        return true;
    }

    function transferFrom(
        address _from,
        address _to,
        uint256 value
    ) external returns (bool) {
        _from;
        _to;
        value;
        return true;
    }

    function approve(address _spender, uint256 _value) external returns (bool) {
        _spender;
        _value;
        return true;
    }

    function allowance(address _owner, address _spender) external view returns (uint256) {
        _owner;
        _spender;
        return 0;
    }

    function balanceOf(address _owner) external view returns (uint256) {
        _owner;
        return 0;
    }

    // Never use
    function setup(address token_addr) external {
        token_addr;
    }
}
