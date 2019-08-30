pragma solidity 0.5.10;

import "openzeppelin-solidity/contracts/token/ERC20/IERC20.sol";
import "./Base.sol";
import "../interface/IVault.sol";

/**
    @title This manages the ethers and tokens transferred to any smart contract.
    @author StablePay <hi@stablepay.io>
    @notice It is used as a Vault because any smart contract transfer the ether to this smart contract.
 */
contract Vault is Base, IVault {
    /** Constants */

    /** Variables */

    /** Modifiers */

    /** Constructor */

    /**
        @notice It creates a new Vault instance associated to an Eternal Storage implementation.
        @param storageAddress the Eternal Storage implementation.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress) public Base(storageAddress) {}

    /** Fallback Method */

    /**
      @notice It receives the ether transferred from user accounts or contracts.
      @dev If the ether is zero, it throws a require error.
     */
    function() external payable {
        require(msg.value > 0, "Msg value is not > 0.");
        emit EthersDeposited(address(this), msg.sender, msg.value);
    }

    /** Functions */

    /**
      @notice It is used to deposit ether to the Vault by default.
      @dev It calls the internal depositEthersInternal() function.
      @dev Remember this function is call from Base smart contract.
      @return true if it received the ether transferred. Otherwise it returns false.
     */
    function depositEthers() external nonReentrant() payable returns (bool) {
        require(msg.value > 0, "Msg value is not > 0.");
        emit EthersDeposited(address(this), msg.sender, msg.value);
        return true;
    }

    /**
        @notice It is used to deposit ERC20 tokens.
        @notice The sender needs to approve the tokens amount before calling this function.
        @param tokenAddress address which represents the ERC20 token.
        @param amount to transfer to this contract.
     */
    function depositTokens(address tokenAddress, uint256 amount)
        external
        nonReentrant()
        returns (bool) {
        require(amount > 0, "Amount must be > 0.");
        require(tokenAddress != address(0x0), "Token address must be != 0x0.");

        IERC20 token = IERC20(tokenAddress);

        require(token.allowance(msg.sender, address(this)) >= amount, "ERC20 allowance is not >= amount.");

        bool transferFromResult = token.transferFrom(msg.sender, address(this), amount);
        require(transferFromResult, "Transfer from sender to Vault failed.");

        emit TokensDeposited(
            address(this),
            tokenAddress,
            msg.sender,
            amount
        );

        return true;
    }

    /**
      @notice It verifies if a specific address has more than a specific amount of tokens in a specific ERC20 token.
      @param contractAddress ERC20 token address.
      @param anAddress address to verify the balance.
      @param amount the minimum amount of token to verify.
      @return true if the address has more than the specific amount of the ERC20 token.
     */
    function hasBalanceInErc(
        address contractAddress,
        address anAddress,
        uint256 amount
    ) internal view returns (bool _hasBalance) {
        return IERC20(contractAddress).balanceOf(anAddress) >= amount;
    }

    /**
      @notice It transfers a specific amount of tokens to an address.
      @dev It checks whether this contract has at least the amount.
      @return true if it transfers the tokens. Otherwise it returns false.
     */
    function transferTokens(
        address tokenAddress,
        address toAddress,
        uint256 amount
    ) external onlySuperUser() nonReentrant() returns (bool) {
        require(tokenAddress != address(0x0), "Token address must be != 0x0.");
        require(toAddress != address(0x0), "Target address must be != 0x0.");
        require(amount > 0, "Amount must be > 0.");
        require(
            hasBalanceInErc(tokenAddress, address(this), amount),
            "Contract has not enough tokens balance."
        );
        bool transferResult = IERC20(tokenAddress).transfer(
            toAddress,
            amount
        );
        require(transferResult, "Transfer tokens was invalid.");

        emit TokensTransferred(
            address(this),
            tokenAddress,
            msg.sender,
            toAddress,
            amount
        );
        return true;
    }

    /**
      @notice It transfers a specific amount of ether to an address.
      @dev It checks if this smart contract has at least the amount of ether.
      @return true if it transfers the ether. Otherwise it returns false.
     */
    function transferEthers(address payable toAddress, uint256 amount)
        external
        onlySuperUser()
        nonReentrant()
        returns (bool)
    {
        require(toAddress != address(0x0), "Target address must be != 0x0.");
        require(amount > 0, "Amount must be > 0.");
        require(
            address(this).balance >= amount,
            "Contract has not enough balance."
        );

        toAddress.transfer(amount);

        emit EthersTransferred(address(this), msg.sender, toAddress, amount);
        return true;
    }
}
