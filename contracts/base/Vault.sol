pragma solidity 0.4.25;

import "../erc20/ERC20.sol";
import "./Base.sol";
import "../interface/IVault.sol";

contract Vault is Base, IVault {
    
    /** Constants */

    /** Variables */

    /** Events */

    /**
      @dev This event is emitted when any tokens amount is withdrawn from the contract.
     */
    event TokensWithdrawn (
      address indexed thisContract,
      address erc20Contract,
      address who,
      address to,
      uint256 amount
    );

    event EthersWithdrawn (
      address indexed thisContract,
      address who,
      address to,
      uint256 amount
    );

    /** Modifiers */

    /** Constructor */
    constructor(address _storage)
      Base(_storage)
      public {
    }

    /** Functions */

    function () payable public {
      require(msg.value > 0, "Msg value > 0.");
      emit DepositReceived(address(this), msg.sender, msg.value);
    }

    function deposit()
      payable
      external
      returns (bool){
        require(msg.value > 0, "Msg value > 0.");

        emit DepositReceived(address(this), msg.sender, msg.value);
    }

    function hasBalanceInErc(address _contractAddress, address _anAddress, uint256 _amount)
      internal
      view
      returns (bool _hasBalance) {
        return ERC20(_contractAddress).balanceOf(_anAddress) >= _amount;
    }

    function transferTokens(address _tokenAddress, address _toAddress, uint256 _amount)
      external
      onlySuperUser()
      nonReentrant()
      returns (bool)
      {
      require(hasBalanceInErc(_tokenAddress, address(this), _amount), "Contract has not enough tokens balance.");
      bool transferResult = ERC20(_tokenAddress).transfer(_toAddress, _amount);
      require(transferResult, "Transfer tokens was invalid.");

      emit TokensWithdrawn (
        address(this),
        _tokenAddress,
        msg.sender,
        _toAddress,
        _amount
      );
      return true;
    }

    function transferEthers(address _toAddress, uint256 _amount)
      external
      onlySuperUser()
      nonReentrant()
      returns (bool)
      {
      require(address(this).balance > _amount, "Contract has not enough balance.");
      
      _toAddress.transfer(_amount);
      
      emit EthersWithdrawn (
        address(this),
        msg.sender,
        _toAddress,
        _amount
      );
      return true;
    }
}