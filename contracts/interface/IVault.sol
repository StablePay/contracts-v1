pragma solidity 0.5.10;

/**
    @title This manages the Ether transferred to any smart contract.
    @author StablePay <hi@stablepay.io>
    @notice It is used as a Vault because any smart contract transfer the ether to this smart contract.
 */
contract IVault {
    /** Events */

    /**
        @notice This event is emitted when any tokens amount is transferred from the contract.
        @param erc20Contract ERC20 where the tokens were withdrawn.
        @param who widthdraw the tokens.
        @param to who received the tokens.
        @param amount total amount transfered.
     */
    event TokensTransferred(
        address indexed thisContract,
        address erc20Contract,
        address who,
        address to,
        uint256 amount
    );

    /**
        @notice This event is emitted when a specific amount of ether is transferred from the contract.
        @param thisContract This smart contract address.
        @param who transferred the tokens.
        @param to who received the tokens.
        @param amount total amount transferred.
     */
    event EthersTransferred(
        address indexed thisContract,
        address who,
        address to,
        uint256 amount
    );

    /**
        @notice This event is emitted when tokens are deposited to this contract.
     */
    event TokensDeposited(
        address indexed thisContract,
        address erc20Contract,
        address from,
        uint256 amount
    );

    /**
        @notice This event is emitted when ethers are deposited to this contract.
     */
    event EthersDeposited(
        address indexed thisContract,
        address from,
        uint256 amount
    );

    /** Functions */

    /**
      @notice It is used to deposit ether to the Vault by default.
      @dev This function is used by the Base smart contract in the fallback function to transfer any ether received.
     */
    function depositEthers() external payable;

    /**
        @notice It is used to deposit ERC20 tokens.
        @param tokenAddress address which represents the ERC20 token.
        @param amount to transfer to this contract.
     */
    function depositTokens(address tokenAddress, uint256 amount) external;

    /**
      @notice It transfers a specific amount of tokens to an address.
      @dev It checks whether this contract has at least the amount.
     */
    function transferTokens(
        address tokenAddress,
        address toAddress,
        uint256 amount
    ) external;

    /**
      @notice It transfers a specific amount of ether to an address.
      @dev It checks if this smart contract has at least the amount of ether.
     */
    function transferEthers(address payable toAddress, uint256 amount) external;
}
