/*
 * NB: since truffle-hdwallet-provider 0.0.5 you must wrap HDWallet providers in a 
 * function when declaring them. Failure to do so will cause commands to hang. ex:
 * ```
 * mainnet: {
 *     provider: function() { 
 *       return new HDWalletProvider(mnemonic, 'https://mainnet.infura.io/<infura-key>') 
 *     },
 *     network_id: '1',
 *     gas: 4500000,
 *     gasPrice: 10000000000,
 *   },
 */

require('dotenv').config();
const Web3 = require("web3");

const DEFAULT_GAS_WEI = 4600000;
const DEFAULT_ADDRESS_COUNT = 10;
const DEFAULT_ADDRESS_INDEX = 0;
const DEFAULT_GAS_GWEI_PRICE = "20";

const web3 = new Web3();
const HDWalletProvider = require("truffle-hdwallet-provider");
var ganache = require("ganache-cli");

const addressCountValue = process.env["ADDRESS_COUNT_KEY"] || DEFAULT_ADDRESS_COUNT;
const mnemonicKeyValue = process.env["MNEMONIC_KEY"] || '';
const infuraKeyValue = process.env["INFURA_KEY"] || '';

if(infuraKeyValue === '' || mnemonicKeyValue === '') {
    console.log('WARNING: The infura key or/and mnemonic key are empty. They should not be empty.');
}

const gasKeyValue = process.env["GAS_WEI_KEY"] || DEFAULT_GAS_WEI;
const gasPriceKeyValue = process.env["GAS_PRICE_GWEI_KEY"] || DEFAULT_GAS_GWEI_PRICE;

module.exports = {
    web3: Web3,
    networks : {
        geth: {
            host: "localhost",
            port: 8045,
            network_id: "*"
        },
        ganache: {
            host: "localhost",
            port: 8545,
            network_id: "*",
            provider: function() {
                return new HDWalletProvider(
                    'concert load couple harbor equip island argue ramp clarify fence smart topic',
                    `http://localhost:8545`,
                    DEFAULT_ADDRESS_INDEX,
                    addressCountValue
                );
            },

        },
        infuraRinkeby: {
            provider: function() {
                return new HDWalletProvider(mnemonicKeyValue, `https://rinkeby.infura.io/${infuraKeyValue}`, DEFAULT_ADDRESS_INDEX, addressCountValue);
            },
            gas: gasKeyValue,
            gasPrice: web3.utils.toWei(gasPriceKeyValue, "gwei"),
            network_id: "5",
        },
        infuraKovan: {
            provider: function() {
                return new HDWalletProvider(mnemonicKeyValue, `https://kovan.infura.io/${infuraKeyValue}`, DEFAULT_ADDRESS_INDEX, addressCountValue);
            },
            gas: gasKeyValue,
            gasPrice: web3.utils.toWei(gasPriceKeyValue, "gwei"),
            network_id: "4",
        },
        infuraRopsten: {
            provider: function() {
                return new HDWalletProvider(mnemonicKeyValue, `https://ropsten.infura.io/${infuraKeyValue}`, DEFAULT_ADDRESS_INDEX, addressCountValue);
            },
            gas: gasKeyValue,
            gasPrice: web3.utils.toWei(gasPriceKeyValue, "gwei"),
            network_id: "3",
        },
        infuraMainnet: {
            provider: function () {
                return new HDWalletProvider(mnemonicKeyValue, `https://mainnet.infura.io/${infuraKeyValue}`, DEFAULT_ADDRESS_INDEX, addressCountValue);
            },
            gas: gasKeyValue,
            gasPrice: web3.utils.toWei(gasPriceKeyValue, "gwei"),
            network_id: "1",
        },
        infuraNet: {
            provider: function () {
                return new HDWalletProvider(mnemonicKeyValue, `https://infuranet.infura.io/${infuraKeyValue}`, DEFAULT_ADDRESS_INDEX, addressCountValue);
            },
            gas: gasKeyValue,
            gasPrice: web3.utils.toWei(gasPriceKeyValue, "gwei"),
            network_id: "2",
        }
    }
};

