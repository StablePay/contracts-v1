pragma solidity 0.4.25;

import "../base/Base.sol";

/*
 * @title Mock contract to can test Base functions and modifiers.
 *
 * @author Guillermo Salazar <guillesalazar@gmail.com>
 */
contract BaseMock is Base {

    /** Instance variables */

    /** Constructor */
    constructor (
        address _storage
    )
    public
    Base(
        _storage
    ) {
    }

    /** Functions */
    function _nonReentrant()
        public
        view
        nonReentrant()
        {}

    function _onlyOwner()
        public
        view
        onlyOwner()
        {}

    function _onlyAdmin()
        public
        view
        onlyAdmin()
        {}

    function _onlySuperUser()
        public
        view
        onlySuperUser()
        {}

    function _onlyRole(string role)
        public
        view
        onlyRole(role)
        {}

    function _isNotPaused()
        public
        view
        isNotPaused()
        {}       
}