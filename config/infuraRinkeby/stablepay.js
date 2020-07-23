const BigNumber = require('bignumber.js');
const DECIMALS = (new BigNumber(10)).pow(18);

module.exports = {
	targetTokens: [
		{
			name: 'OMG',
			minAmount: BigNumber("1").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("5000").times(DECIMALS).toFixed()
		},
		{
			name: 'DAI_COMPOUND', // To test Compound.finance Post Action 
			minAmount: BigNumber("1").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("5000").times(DECIMALS).toFixed()
		},
		{
			name: 'SNT',
			minAmount: BigNumber("1").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("5000").times(DECIMALS).toFixed()
        },
        {
			name: 'WETH', // Used to send Ether to the receiver in a post action.
			minAmount: BigNumber("0.0001").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("5").times(DECIMALS).toFixed()
		}
	],
	contracts: {
        StablePay: '0x99cdAE1a6C453909FCE04165907bC73C06006f11',
        StablePayStorage: '0xe4bb84db864aaa50921D10e1108572Bc71509510',
        Settings: '0x4bAa238D78d5F32AfA207B4AEA7d1E64f12cDE95',
        Vault: '0xDF109aE7764fE55892f8bEB31C2a3D367673728B',
        KyberSwappingProvider: '0x1B22d391Ff01E73857a8d12dfe8Da03ceeccB8ab',
        UniswapSwappingProvider: '0xB462aa1BF6B471cff37287F2c2f2Cf0Cf0DE22F7',
        TransferToPostAction: '0x02304eD3B9698e79f974E0f26025cb985acd3AE0',
        PostActionRegistry: '0x99b7Dd80B4df2D95f45ee23029Be12418e00234E',
        Storage: '0xe36206Aa1597A4CB964F26301f1796315cE13DCF',
        Registration: '0x511fAf0476C4aC67Ce25D15cE6a5F1D575E55741',
        CompoundSettings: '0xFEf6a7dD67cB4D0a743a61d59ceF301eEF88407B',
        CompoundMintPostAction: '0x0205b22c3101E10e54554aa9799D89cAEcFbb97A',
        EtherTransferPostAction: '0x49152dA83eA1316B84C04Ea2eaD4ABbEC9758103',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
