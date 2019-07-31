pragma solidity 0.5.3;

import "../../services/uniswap/UniswapFactoryInterface.sol";

contract CustomUniswapFactoryMock is UniswapFactoryInterface {
    // Public Variables
    address public exchange;
    address public token;
    uint256 public tokenCount;

    constructor(address _exchange, address _token) public {
        exchange = _exchange;
        token = _token;
    }

    // Create Exchange
    function createExchange(address _token)
    external
    returns (address) {
        _token;
        return exchange;
    }

    // Get Exchange and Token Info
    function getExchange(address _token)
    external
    view returns (address) {
        _token;
        return exchange;
    }

    function getToken(address _exchange)
    external
    view returns (address) {
        _exchange;
        return token;
    }

    function getTokenWithId(uint256 tokenId)
    external
    view returns (address){
        tokenId;
        return token;
    }

    function initializeFactory(address template)
    external {
        template;
    }
}