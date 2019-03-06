pragma solidity 0.4.25;
pragma experimental ABIEncoderV2;

import "../util/StablePayCommon.sol";
import "../erc20/ERC20.sol";

contract ISwappingProvider {

    /** Events */

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
     */
    function getExpectedRate(ERC20 src, ERC20 dest, uint srcQty) public view returns (bool isSupported, uint minRate, uint maxRate);

    //function isValidSwapData(StablePayCommon.Order order) public view returns (bool);
}