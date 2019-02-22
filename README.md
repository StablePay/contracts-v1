# StablePay

## What is StablePay?

StablePay is a decentralized platform which allows people to send and receive cryptocurrency payments converted to USD in the easy way.

StablePay is the secure and decentralized payment platform for the new internet of money.

StablePay was one of the bounty prize winners in ETHSanFrancisco 2018. See more information about  [StablePay in ETHSanFrancisco 2018](https://devpost.com/software/stablepay).
To see more information, please visit [StablePay website](https://stablepay.io).


## Description

This repository contains the offical StablePay platform smart contracts. 

# Development

## Calculate Source Tokens Amount

```js
const targetAmount = "100";`
const unitRateWei = "10004459276022295300"
const platformFee = "1"
```
At the begining, I just have the product price (or target amount)
```js
const amountsCalculator = new AmountsCalculator(targetAmount); // 100 DAIs (product price)
```
Based on the returned rate, the unit price is unitRateWei / 10^18. It means: 1 ```SourceToken = unitPrice = unitRateWei / 10^18```
```js
const unitPrice = amountsCalculator.calculateUnitPrice(unitRateWei);
console.log(`1 SourceToken = ${unitPrice.toString()} TargetToken`);
```
**Note: the variable 'unitRateWei' is returned by KyberNetworkProxy.getExpectedRate().slippageRate**
I need to calculate the source amount needed to buy the 'target amount tokens' based on a rate.
```js
const sourceAmountNeeded = amountsCalculator.calculateAmountBased(unitRateWei);
```
Based on the target amount (see when amounts calculator was instanced), and the unitRateWei, I need to know, how many source amount tokens I need to sell in order to buy the specified source target amount.
```js
console.log(`${sourceAmountNeeded} SourceToken == ${targetAmount} TargetToken`);
```
Calculate the amount with fee included.
```js
const amountWithFee = amountsCalculator.calculateAmountWithFee(platformFee);
```
Calculate only the fee amount.
```js 
const amountFee = amountsCalculator.calculateAmountFee(platformFee);
```
Calculate the source amount with the fee amount included.
```js
const sourceAmountNeededWithFee = amountsCalculator.calculateAmountBasedFee(unitRateWei, platformFee);
console.log(`${sourceAmountNeededWithFee} SourceTokens == ${amountWithFee} (${targetAmount} + ${amountFee}) TargetToken`)
```

## Running Tests

### Unit Tests

```truffle test```

### Integration Tests

In order to execute the integration tests, you need to use ```ganache-cli```, and the following **MNEMONIC**:

```gesture rather obey video awake genuine patient base soon parrot upset lounge```

The steps are:

- Unzip the file located at ```/resources/kyber-ganache-template.zip``` into ```/kyber_db``` folder (in root level). The files (without subfolder) must be within the ```/kyber_db``` folder.
- Copy/paste the file located at ```/resources/kyber-ganache-template-conf.js``` into ```/conf/ganache/```, and save as ```kyber.js``` (replace current one if it is needed).
- Copy the MNEMONIC value in the file ```/resources/kyber-ganache-template-conf-mnemonic.js```.
- Replace the ```MNEMONIC_KEY``` key in your ```.env``` file with the value copied in the previous step.
- Start ganache-cli in a bash console (**CHECK THE MNEMONIC VALUE**):

    ```ganache-cli --db ./kyber_db --accounts 10 --mnemonic 'gesture rather obey video awake genuine patient base soon parrot upset lounge' --networkId 5777 --debug```

- Once ganache-cli started, run the integration test **using a new bash console** using the command below:

    ```truffle test ./test-integration/StablePay_KyberSwappingProviderSwapTokenTest.js --network ganache```


# Architecture Diagram for StablePay

![diagram](https://github.com/StablePay/stablepay_contracts/blob/master/docs/Screen%20Shot%202018-10-06%20at%208.44.34%20PM.png)

ganache-cli --db ./path-local-db --accounts 10 --mnemonic 'concert load couple harbor equip island argue ramp clarify fence smart topic' --networkId 5777 --debug