//import {NetworkSpecificConfigs} from "./types";

const { GANACHE_NETWORK_ID, KOVAN_NETWORK_ID, ROPSTEN_NETWORK_ID } = require( './constants');
//const { NetworkSpecificConfigs } = require( './types');
// export interface NetworkSpecificConfigs {
//     rpcUrl: string;
//     networkId: number;
// }

const TX_DEFAULTS = { gas: 400000 };
const MNEMONIC = 'concert load couple harbor equip island argue ramp clarify fence smart topic';
//export const MNEMONIC = 'add mask man biology naive setup cash mammal fox stumble roof remind';
const BASE_DERIVATION_PATH = `44'/60'/0'/0`;
const GANACHE_CONFIGS = {
    rpcUrl: 'http://127.0.0.1:8545',
    networkId: GANACHE_NETWORK_ID,
};
const KOVAN_CONFIGS = {
    rpcUrl: 'https://kovan.infura.io/',
    networkId: KOVAN_NETWORK_ID,
};
const ROPSTEN_CONFIGS  = {
    rpcUrl: 'https://ropsten.infura.io/',
    networkId: ROPSTEN_NETWORK_ID,
};
const NETWORK_CONFIGS = GANACHE_CONFIGS; // or KOVAN_CONFIGS or ROPSTEN_CONFIGS

module.exports = {
    TX_DEFAULTS,
    MNEMONIC,
    BASE_DERIVATION_PATH,
    GANACHE_CONFIGS,
    ROPSTEN_CONFIGS,
    NETWORK_CONFIGS
}