const { BigNumber } = require( '0x.js');

// tslint:disable-next-line:custom-no-magic-numbers
const ONE_SECOND_MS = 1000;
// tslint:disable-next-line:custom-no-magic-numbers
const ONE_MINUTE_MS = ONE_SECOND_MS * 60;
// tslint:disable-next-line:custom-no-magic-numbers
const TEN_MINUTES_MS = ONE_MINUTE_MS * 10;
// tslint:disable-next-line:custom-no-magic-numbers
const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1);
// tslint:disable-next-line:custom-no-magic-numbers
 const DECIMALS = 18;
const NULL_ADDRESS = '0x0000000000000000000000000000000000000000';
const ZERO = new BigNumber(0);
const GANACHE_NETWORK_ID = 50;
const KOVAN_NETWORK_ID = 42;
const ROPSTEN_NETWORK_ID = 3;

module.exports = {
    ONE_SECOND_MS,
    ONE_MINUTE_MS,
    TEN_MINUTES_MS,
    UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
    DECIMALS,
    NULL_ADDRESS,
    ZERO,
    GANACHE_NETWORK_ID,
    KOVAN_NETWORK_ID,
    ROPSTEN_NETWORK_ID
}
