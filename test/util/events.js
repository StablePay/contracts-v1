// @dev see details on https://www.npmjs.com/package/truffle-assertions
const truffleAssert = require('truffle-assertions');

const emitted = (tx, eventName, assertFunction) => {
    truffleAssert.eventEmitted(tx, eventName, event => {
        assertFunction(event);
        return true;
    });
};

const notEmitted = (tx, eventName, assertFunction) => {
    truffleAssert.eventNotEmitted(tx, eventName, event => {
        assertFunction(event);
        return true;
    });
}

module.exports = {
    base: {
        depositReceived: tx => {
            const name = 'DepositReceived';
            return {
                name: name,
                emitted: (thisContract, from, amount) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, thisContract);
                    assert.equal(ev.from, from);
                    assert.equal(ev.amount.toString(), amount.toString());
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        paymentSent: tx => {
            const name = 'PaymentSent';
            return {
                name: name,
                emitted: (thisContract, merchant, customer, sourceToken, targetToken, amount) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, thisContract);
                    assert.equal(ev.merchant, merchant);
                    assert.equal(ev.customer, customer);
                    assert.equal(ev.sourceToken, sourceToken);
                    assert.equal(ev.targetToken, targetToken);
                    assert.equal(ev.amount.toString(), amount.toString());
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        }
    },
    upgrade: {
        contractUpgraded: tx => {
            const name = 'ContractUpgraded';
            return {
                name: name,
                emitted: (contractAddress, oldContractAddress, newContractAddress, contractName) => emitted(tx, name, ev => {
                    assert.equal(ev.contractAddress, contractAddress);
                    assert.equal(ev.oldContractAddress, oldContractAddress);
                    assert.equal(ev.newContractAddress, newContractAddress);
                    assert.equal(ev.contractName, contractName);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        pendingBalance: tx => {
            const name = 'PendingBalance';
            return {
                name: name,
                emitted: (contractAddress, oldContractAddress, newContractAddress, contractName, balance) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, contractAddress);
                    assert.equal(ev.oldContractAddress, oldContractAddress);
                    assert.equal(ev.newContractAddress, newContractAddress);
                    assert.equal(ev.contractName, contractName);
                    assert.equal(ev.balance.toString(), balance.toString());
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        }
    },
    registryProvider: {
        newSwappingProviderRegistered: tx => {
            const name = 'NewSwappingProviderRegistered';
            return {
                name: name,
                emitted: (contractAddress, providerKey, providerAddress, providerOwner) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, contractAddress);
                    assert.equal(ev.providerKey, providerKey);
                    assert.equal(ev.swappingProvider, providerAddress);
                    assert.equal(ev.owner, providerOwner);
                    assert(ev.createdAt);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        swappingProviderPaused: tx => {
            const name = 'SwappingProviderPaused';
            return {
                name: name,
                emitted: (thisContract, providerAddress) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, thisContract);
                    assert.equal(ev.providerAddress, providerAddress);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        swappingProviderUnpaused: tx => {
            const name = 'SwappingProviderUnpaused';
            return {
                name: name,
                emitted: (thisContract, providerAddress) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, thisContract);
                    assert.equal(ev.providerAddress, providerAddress);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        }
    },
    settings: {
        platformFeeUpdated: tx => {
            const name = 'PlatformFeeUpdated';
            return {
                name: name,
                emitted: (thisContract, oldPlatformFee, newPlatformFee) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, thisContract);
                    assert.equal(ev.oldPlatformFee.toString(), oldPlatformFee.toString());
                    assert.equal(ev.newPlatformFee.toString(), newPlatformFee.toString());
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        platformPaused: tx => {
            const name = 'PlatformPaused';
            return {
                name: name,
                emitted: (thisContract, reason) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, thisContract);
                    assert.equal(ev.reason, reason);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        platformUnpaused: tx => {
            const name = 'PlatformUnpaused';
            return {
                name: name,
                emitted: (thisContract, reason) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, thisContract);
                    assert.equal(ev.reason, reason);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        tokenAvailabilityUpdated: tx => {
            const name = 'TokenAvailabilityUpdated';
            return {
                name: name,
                emitted: (thisContract, tokenAddress, minAmount, maxAmount, enabled) => emitted(tx, name, ev => {
                    assert.equal(ev.thisContract, thisContract);
                    assert.equal(ev.tokenAddress, tokenAddress);
                    assert.equal(ev.minAmount.toString(), minAmount);
                    assert.equal(ev.maxAmount.toString(), maxAmount);
                    assert.equal(ev.enabled, enabled);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        }
    },
    role: {
        roleAdded: tx => {
            const name = 'RoleAdded';
            return {
                name: name,
                emitted: (anAddress, roleName) => emitted(tx, name, ev => {
                    assert.equal(ev.anAddress, anAddress);
                    assert.equal(ev.roleName, roleName);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        roleRemoved: tx => {
            const name = 'RoleRemoved';
            return {
                name: name,
                emitted: (anAddress, roleName) => emitted(tx, name, ev => {
                    assert.equal(ev.anAddress, anAddress);
                    assert.equal(ev.roleName, roleName);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        },
        ownershipTransferred: tx => {
            const name = 'OwnershipTransferred';
            return {
                name: name,
                emitted: (previousOwner, newOwner) => emitted(tx, name, ev => {
                    assert.equal(ev.previousOwner, previousOwner);
                    assert.equal(ev.roleName, newOwner);
                }),
                notEmitted: (assertFunction = () => {} ) => notEmitted(tx, name, assertFunction)
            };
        }
    }
}