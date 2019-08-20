pragma solidity 0.5.3;

/**
    @title This manages the post action smart contracts for the platform.

    @author StablePay <hi@stablepay.io>
    @notice It gives the platform flexibility and extensibility to make actions after the swapping was done.
    @dev Each post action is a smart contract which implements IPostAction interface.
 */
interface IPostActionRegistry {
    /** Events */

    /**
        @notice This event is emitted when a new post action is registered.
     */
    event NewPostActionRegistered(
        address indexed thisContract,
        address postAction,
        address owner,
        uint256 registeredAt
    );

    /**
        @notice This event is emitted when a post action is set as default.
     */
    event NewDefaultPostAction(
        address indexed thisContract,
        address previousDefaultPostAction,
        address newDefaultPostAction,
        address owner,
        uint256 registeredAt
    );

    /**
        @notice This event is emitted when a current post action is unregistered.
     */
    event PostActionUnregistered(
        address indexed thisContract,
        address postAction,
        address owner,
        uint256 unregisteredAt
    );

    /** Functions */

    /**
        @notice It registers a new post action in the platform.
        @dev The sender must be a super user.
        @dev Remember to register the post action into the platform to able access to other contracts in the platform.
        @dev See Registration or Upgrade smart contracts.
        @param newPostAction the post action address to register.
        @return true if the post action is registered. Otherwise it returns false.
     */
    function registerPostAction(address newPostAction) external returns (bool);

    /**
        @notice It unregisters a already registered post action in the platform.
        @dev The sender must be a super user.
        @param postAction the post action to unregister.
        @return true if the post action is unregistered. Otherwise it returns false.
     */
    function unregisterPostAction(address postAction) external returns (bool);

    /**
        @notice It tests whether a post action address is already registered.
        @param postAction to test whether it is registered.
        @return true if post action is registered. Otherwise it returns false.
     */
    function isRegisteredPostAction(address postAction)
        external
        view
        returns (bool);

    /**
        @notice It gets the post action or the default post action if the post action passed a parameter is not valid (pre-registered).
        @param postAction post action to verify if it is registered.
        @return the post action passed as parameter if it is registered. Otherwise it returns the default post action.
     */
    function getPostActionOrDefault(address postAction)
        external
        view
        returns (address);

    /**
        @notice It gets the default post action.
        @return the default post action.
     */
    function getDefaultPostAction() external view returns (address);

    /**
        @notice It sets a post action as default in the platform.
        @param postAction post action address to set as default in the platform.
        @return true if the post action is set as default. Otherwise it returns false.
     */
    function setPostActionAsDefault(address postAction) external returns (bool);
}
