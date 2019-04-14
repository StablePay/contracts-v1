pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../util/SafeMath.sol";
import "../util/StablePayCommon.sol";
import "../erc20/ERC20.sol";

contract ISwappingProvider {
    using SafeMath for uint256;

    /** Events */

    /**
        @dev This event is emitted when a deposit is received.
     */
    event DepositReceived (
        address indexed thisContract,
        address from,
        uint amount
    );

    /**
        @dev This event is emitted when a ether transfer is sent.
        @dev It is used to transfer ether back to the customer.
     */
    event TransferEther (
        address indexed thisContract,
        address from,
        address to,
        uint amount
    );

    /** Properties */
    address public stablePay;

    /** Modifiers */

    modifier isStablePay(address _anAddress) {
        require(stablePay == _anAddress, "Address must be StablePay");
        _;
    }

    /** Constructor */

    constructor(address _stablePay) public {
        stablePay = _stablePay;
    }

    /** Fallback Method */

    function () external payable {
        require(msg.value > 0, "Value must be > 0");
        // @dev https://ethereum.stackexchange.com/questions/19341/address-send-vs-address-transfer-best-practice-usage/38642#38642
        // @dev https://ropsten.etherscan.io/tx/0xbb7bd5c4ba0d5a4d4141b5f1b759f75253dacb58b85a71e7848ef9295872046f#internal payWithEther
        // TODO Check stablePay.call.value(msg.value)();
        emit DepositReceived(
            address(this),
            msg.sender,
            msg.value
        );
    }

    /**
        @dev It gets the current balance for this smart contract for a specific token (ERC20).
        @dev It returns the balance. 
     */
    function getTokenBalanceOf(address token)
    internal
    view
    returns (uint)
    {
        return ERC20(token).balanceOf(address(this));
    }

    /**
        @dev It gets the current ether balance for this smart contract.
        @dev It returns the current balance.
     */
    function getEtherBalance()
    internal
    view
    returns (uint)
    {
        return address(this).balance;
    }

    function calculateDiffBalance(uint sentAmount, uint initialBalance, uint finalBalance)
    internal
    pure
    returns (uint diffBalance)
    {

        require(initialBalance >= finalBalance, "SwappingProvider: Initial balance >= final balance.");
        uint used = initialBalance.sub(finalBalance);

        require(sentAmount >= used, "SwappingProvider: Sent amount >= used.");
        uint diff = sentAmount.sub(used);
        return diff;
    }

    /**
        @dev It transfers tokens (diff between initial - final balance) to a specific address when diff is higher than zero.
        @dev If the initial balance is not higher (or equals) than final balance, it throws a require error.
     */
    function transferDiffTokensIfApplicable(address token, address to, uint sentAmount, uint initialBalance, uint finalBalance)
    internal
    returns (bool)
    {
        uint tokensDiff = calculateDiffBalance(sentAmount, initialBalance, finalBalance);
        if(tokensDiff > 0) {
            bool transferResult = ERC20(token).transfer(to, tokensDiff);
            require(transferResult, "Transfer tokens back failed.");
        }
        return true;
    }

    /**
        @dev It transfers back to an address the diff balances.
        @dev It assumes that the contract may already have balance.
        @dev Base on that, this function get the diff balance between what the sender sent and paid. The diff is transfer back to the sender.
        @dev Remember: After the swapping the final balance is lower than initial balance.
     */
    function transferDiffEtherBalanceIfApplicable(address to, uint sentAmount, uint initialBalance, uint finalBalance)
    internal
    returns (bool)
    {
        uint diffAmount = calculateDiffBalance(sentAmount, initialBalance, finalBalance);
        if(diffAmount > 0) {
            // @see https://solidity.readthedocs.io/en/develop/types.html#members-of-addresses
            to.transfer(diffAmount);
            emit TransferEther (
                address(this),
                address(this),
                to,
                diffAmount
            );
        }
        return true;
    }

    /**
        @dev It approves a specific amount of tokens to be used for a specific address. Set the spender's token allowance to amount.
        @dev It mitigates a front-running attach approving a zero amount of tokens before the specific amount.
        @dev If any approve invocation returns false, it throws a require error.
     */
    function approveTokensTo(ERC20 token, address to, uint amount)
    internal
    returns (bool)
    {
        // Mitigate ERC20 Approve front-running attack, by initially setting allowance to 0
        require(token.approve(to, 0), "Error mitigating front-running attack.");
        // Set the spender's token allowance to tokenQty
        require(token.approve(to, amount), "Error approving tokens for proxy.");
        return true;
    }

    /**
        @dev It gets the expected rates for the pair (source/target tokens).
        @dev It requires that the swapping is supported. if not, it throws a require error.
        @dev It returns the min/max expected rates.
     */
    function getExpectedRateIfSupported(ERC20 sourceToken, ERC20 targetToken, uint sourceAmount)
    internal
    view
    returns (uint minRate, uint maxRate)
    {
        bool isSupported;
        uint minRateValue;
        uint maxRateValue;
        // Get expected rates for the swapping source/target tokens.
        (isSupported, minRateValue, maxRateValue) = getExpectedRate(sourceToken, targetToken, sourceAmount);
        // Check whether the swapping is supported.
        require(isSupported, "Swapping not supported. Verify source/target amount.");
        return (minRateValue, maxRateValue);
    }

    /**
        @dev Perform the swapping between tokens.
        @dev The function must transfer the target tokens to the StablePay smart contract.
        @dev After the transfer, the StablePay contract will check the transfer result.
        @param order info to perform the swapping.
     */
    function swapToken(StablePayCommon.Order order) public returns (bool);

    /**
        @dev Perform the swapping between ether and a token.
        @dev Before finishing this function must transfer the target tokens to the StablePay smart contract in order to continue with the swapping process.
        @param order info to perform the swapping. 
     */
    function swapEther(StablePayCommon.Order order) public payable returns (bool);

    /**
        @dev Calculate the expected values (min and max) to perform the swapping.
        @dev Return whether the swapping those tokens is supported or not, and the rates. 
     */
    function getExpectedRate(ERC20 src, ERC20 dest, uint srcQty) public view returns (bool isSupported, uint minRate, uint maxRate);
}