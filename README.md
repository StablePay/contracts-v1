# StablePay Smart Contracts

## Description

TODO COMPLETE

# Development

## Running Tests

### Unit Tests

```truffle test```

### Integration Tests

In order to execute the integration tests, you need to use ```ganache-cli```, and the following **MNEMONIC**:

```concert load couple harbor equip island argue ramp clarify fence smart topic```

The steps are:

- Unzip the file located at ```/resources/kyber-ganache-template.zip``` into ```/kyber_db``` folder (in root level). The files (without subfolder) must be within the ```/kyber_db``` folder.
- Copy/paste the file located at ```/resources/kyber-ganache-template-conf.js``` into ```/conf/ganache/```, and save as ```kyber.js``` (replace current one if it is needed).
- Copy the MNEMONIC value in the file ```/resources/kyber-ganache-template-conf-mnemonic.js```.
- Replace the ```MNEMONIC_KEY``` key in your ```.env``` file with the value copied in the previous step.
- Start ganache-cli in a bash console (**CHECK THE MNEMONIC VALUE**):

    ```ganache-cli --db ./kyber_db --accounts 10 --mnemonic 'concert load couple harbor equip island argue ramp clarify fence smart topic' --networkId 5777 --debug```

- Once ganache-cli started, run the integration test **using a new bash console** using the command below:

    ```truffle test ./test-integration/StablePay_KyberSwappingProviderSwapTokenTest.js --network ganache```


# Architecture Diagram for StablePay

![diagram](https://github.com/StablePay/stablepay_contracts/blob/master/docs/Screen%20Shot%202018-10-06%20at%208.44.34%20PM.png)

ganache-cli --db ./path-local-db --accounts 10 --mnemonic 'concert load couple harbor equip island argue ramp clarify fence smart topic' --networkId 5777 --debug