const _ = require('lodash');
const leche = require('leche');
const withData = leche.withData;

const MockContract = artifacts.require("./Mock.sol");
const Registration = artifacts.require("./base/Registration.sol");
const t = require('../util/consts').title;
const { registration } = require('../util/events');
const { NULL_ADDRESS } = require('../util/consts');

contract('RegistrationTest', function (accounts) {
    const owner = accounts[0];
    const account1 = accounts[1];
    let instance;

    beforeEach('Setup contract for each test', async () => {
        instance = await Registration.deployed();
    });

    withData({
        _1_basic: ['MyContract', false, owner, undefined, false],
        _2_notOwner: ['MyContract2', false, account1, 'Msg sender does not have permission.', true],
        _3_emptyContractAddress: ['MyContract3', true, owner, 'invalid address', true],
    }, function(contractName, emptyContractAddress, fromAddress, messageExpected, mustFail) {
        it(t('anUser/Owner', 'registerContract', 'Should be able (or not) to register a new smart contract in the platform.', mustFail), async function() {
            //Setup
            const newContractAddress = emptyContractAddress ? NULL_ADDRESS : await MockContract.new();

            try {
                //Invocation
                const result = await instance.registerContract(
                    contractName,
                    newContractAddress.address, {
                        from: fromAddress
                    }
                );

                // Assertions
                assert(!mustFail, 'It should have failed because data is invalid.');
                assert(result);
                registration
                    .newContractRegistered(result)
                    .emitted(
                        instance.address,
                        newContractAddress.address,
                        contractName
                    );
            } catch (error) {
                // Assertions
                assert(mustFail);
                assert(error);
                assert.equal(error.reason, messageExpected);
            }
        });
    });

    withData({
        _1_basic: ['NewContract1', owner, 'NewContract1', ''],
        _2_notRegistered: ['NewContract2', owner, 'NewContract2b', undefined],
    }, function(contractName, fromAddress, contractNameToVerify, expectedContractAddress) {
        it(t('anUser/Owner', 'getContractAddress', 'Should be able to get contract address associated to a contract name.', false), async function() {
            //Setup
            const newContract = await MockContract.new();
            await instance.registerContract(
                contractName,
                newContract.address, {
                    from: fromAddress
                }
            );

            //Invocation
            const result = await instance.getContractAddress(contractNameToVerify);

            // Assertions
            assert(result);
            if(_.isUndefined(expectedContractAddress)) {
                assert.equal(result.toString(), NULL_ADDRESS);
            } else {
                assert.equal(result.toString(), newContract.address);
            }
        });
    });
});