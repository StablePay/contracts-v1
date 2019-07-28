pragma solidity 0.5.3;

import "../base/Base.sol";
import "../util/SafeMath.sol";
import "../interface/IPostActionRegistry.sol";

contract PostActionRegistry is Base, IPostActionRegistry {
    using SafeMath for uint256;

    /** Constants */
    string constant internal PLATFORM_DEFAULT_POST_ACTION = "config.platform.defaultPostAction";

    /** Properties */

    /**
        @dev This mapping is used to store actions.
     */
    mapping (address => bool) public actions;

    /** Modifiers */

    modifier isValidAddress(address postAction) {
        require(postAction != address(0x0), "Post action must be != 0x0.");
        _;
    }

    modifier postActionExists(address postAction) {
        require(actions[postAction] == true, "Post action must exist.");
        _;
    }

    modifier postActionNotExists(address postAction) {
        require(actions[postAction] == false, "Post action must not exist.");
        _;
    }

    /** Constructor */

    constructor(address storageAddress)
        public Base(storageAddress) {
    }

    /** Fallback Method */

    /** Functions */

    function registerPostAction(address newPostAction)
    external
    onlySuperUser
    isValidAddress(newPostAction)
    postActionNotExists(newPostAction)
    returns (bool) {

        actions[newPostAction] = true;

        emit NewPostActionRegistered(
            address(this),
            newPostAction,
            msg.sender,
            now
        );

        return true;
    }

    function unregisterPostAction(address postAction)
    external
    onlySuperUser
    isValidAddress(postAction)
    postActionExists(postAction)
    returns (bool) {
        actions[postAction] = false;

        emit PostActionUnregistered(
            address(this),
            postAction,
            msg.sender,
            now
        );
        return true;
    }

    function isRegisteredPostAction(address postAction)
    external
    view
    returns (bool) {
        return isRegisteredPostActionInternal(postAction);
    }

    function isRegisteredPostActionInternal(address postAction)
    internal
    view
    returns (bool) {
        return actions[postAction];
    }

    function getDefaultPostAction()
    external
    view
    returns (address) {
        return getDefaultPostActionInternal();
    }

    function getDefaultPostActionInternal()
    internal
    view
    returns (address) {
        return _storage.getAddress(keccak256(abi.encodePacked(PLATFORM_DEFAULT_POST_ACTION)));
    }

    function getPostActionOrDefault(address postAction)
    external
    view
    returns (address) {
        bool isRegistered = isRegisteredPostActionInternal(postAction);
        return isRegistered ? postAction : getDefaultPostActionInternal();
    }

    function setPostActionAsDefault(address postAction)
    external
    onlySuperUser
    isValidAddress(postAction)
    postActionExists(postAction)
    returns (bool) {
        address previousDefaultPostAction = getDefaultPostActionInternal();
        require(previousDefaultPostAction != postAction, "New default post action must be != from current.");

        _storage.setAddress(keccak256(abi.encodePacked(PLATFORM_DEFAULT_POST_ACTION)), postAction);
        
        emit NewDefaultPostAction(
            address(this),
            previousDefaultPostAction,
            postAction,
            msg.sender,
            now
        );
        return true;
    }
}