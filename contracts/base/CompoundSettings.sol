pragma solidity 0.5.10;

import "../base/Base.sol";
import "../util/AddressLib.sol";
import "../interface/ICompoundSettings.sol";

/**
    @title This smart contract manages the Compound.Finance settings.
    @author StablePay <hi@stablepay.io>

    @dev Only owner or admin users can invoke some functions.
 */
contract CompoundSettings is Base, ICompoundSettings {
    using AddressLib for address;

    /** Constants */
    string internal constant PLATFORM_CERC20 = "config.platform.cerc20";

    /** Properties */

    /** Modifiers */

    /** Constructor */

    /**
        @notice It creates a new CompoundSettings instance associated to an Eternal Storage implementation.
        @param storageAddress the Eternal Storage implementation.
        @dev The Eternal Storage implementation must implement the IStorage interface.
     */
    constructor(address storageAddress) public Base(storageAddress) {}

    /** Fallback Method */

    /** Functions */

    /**
        @notice It maps a ERC20 token to a CErc20 token (Compound.finance platform implementation).
        @param erc20Address ERC20 implementation address.
        @param cErc20Address CErc20 implementation address
     */
    function mapErc20ToCEr20(address erc20Address, address cErc20Address)
        external
        onlySuperUser()
        nonReentrant()
    {
        erc20Address.requireNotEmpty("ERC20 address must not be 0x0.");
        cErc20Address.requireNotEmpty("CERC20 address must not be 0x0.");

        address currentCErc20Address = getCEr20Internal(erc20Address);
        currentCErc20Address.requireEmpty("Current CEr20 must be 0x0.");

        _storage.setAddress(
            keccak256(abi.encodePacked(PLATFORM_CERC20, erc20Address)),
            cErc20Address
        );

        emit Erc20ToCEr20MappingCreated(
            address(this),
            erc20Address,
            cErc20Address
        );
    }

    /**
        @notice It updates the current CErc20 mapping for a ERC20.
        @param erc20Address ERC20 implementation address.
        @param newCErc20Address new CErc20 implementation address.
     */
    function updateMapErc20ToCEr20(
        address erc20Address,
        address newCErc20Address
    ) external onlySuperUser() nonReentrant() {
        erc20Address.requireNotEmpty("ERC20 address must not be 0x0.");
        newCErc20Address.requireNotEmpty("CERC20 address must not be 0x0.");

        address currentCErc20Address = getCEr20Internal(erc20Address);
        currentCErc20Address.requireNotEmpty("Current CErc20 must NOT be 0x0.");
        currentCErc20Address.requireNotEqualTo(
            newCErc20Address,
            "Current CErc20 must NOT be equal to new CErc20."
        );

        _storage.setAddress(
            keccak256(abi.encodePacked(PLATFORM_CERC20, erc20Address)),
            newCErc20Address
        );

        emit Erc20ToCEr20MappingUpdated(
            address(this),
            currentCErc20Address,
            erc20Address,
            newCErc20Address
        );
    }

    /**
        @notice It gets the current CErc20 mapping for a specific ERC20 address.
        @param erc20Address ERC20 address to get the mapping.
        @return the current CErc20 mapping for a specific ERC20 address.
     */
    function getCEr20(address erc20Address) external view returns (address) {
        return getCEr20Internal(erc20Address);
    }

    function getCEr20Internal(address erc20Address)
        internal
        view
        returns (address)
    {
        return
            _storage.getAddress(
                keccak256(abi.encodePacked(PLATFORM_CERC20, erc20Address))
            );
    }

    /**
        @notice It tests whether an ERC20 address is supported or not.
        @param erc20Address ERC20 address to test.
        @return true if ERC20 address has a CErc20 mapped. Otherwise, it returns false.
     */
    function supportErc20(address erc20Address) external view returns (bool) {
        return getCEr20Internal(erc20Address) != address(0x0);
    }
}
