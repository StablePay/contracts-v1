[![StablePay.io](https://stablepay.io/static/twitter.jpg)](https://stablepay.io)

---
## Description

This is the official [StablePay](https://stablepay.io) repository for the smart contracts.

## What is StablePay?

[StablePay](https://stablepay.io) is a decentralized platform for the new internet of money. [StablePay](https://stablepay.io) allows people to send/receive any ERC20 token and ether and receive any ERC20 token or ether in a secured and easy way.

> StablePay was one of the **bounty prize winners** in ETHSanFrancisco 2018.

To see more information, please visit:

* [StablePay](https://stablepay.io) website.
* Post in [ETH San Francisco Hackathon 2018](https://devpost.com/software/stablepay).

## Architecture Diagram

![diagram](./docs/images/architecture.png)

---

## Get Started

### Checkout the repository

```sh
$ git checkout https://github.com/StablePay/stablepay_contracts.git
```

### Install dependencies

```sh
$ npm install
```
and install Truffle globally executing the npm command below:
```sh
$ npm install truffle -g
```

### Setup Environment Variables

The platform needs some env variables to be configured properly. In order to configure them, create a `.env` file based on the `.env.template` file.

Once the file was created, it needs to setup some values. Please, follow the instruction to setup these values before executing any command.

#### Infura

The **INFURA_KEY** key is needed to execute smart contracts in a testnet or mainnet. To get a key, just visit *https://infura.net*, and signup.

#### Mnemonic

 The **MNEMONIC_KEY** key is used to get/create the ethereum addresses.

#### Platform Fee

 The **PLATFORM_FEE** is used to calculate the fee amount in each transaction in the smart contract execution. By default it is 1% (the platform fee value is multiplied by 100. So 2% is 200). **So, it is not required to modify the default value.**

### Run tests

After configuring the environment variables, the tests can be executed.

#### Unit Tests

```sh
$ truffle test
```

#### Integration Tests

In progress.

---

## Contact Us

If you have any question or feedback, contact us emailing at hi@stablepay.io.