const util = require('ethereumjs-util');

class ProviderKeyGenerator {
    constructor() {
    }
}

ProviderKeyGenerator.prototype.generateKey = function(name, version) {
    const providerName = `${name}_v${version}`;
    return {
        name: providerName,
        providerKey: util.bufferToHex(util.setLengthRight(providerName, 32))
    };
}

module.exports = ProviderKeyGenerator;