const BigNumber = require('bignumber.js');
const DAI_DECIMALS = (new BigNumber(10)).pow(18);

module.exports = {
    targetTokens: [
		{
			name: 'DAI',
			minAmount: BigNumber("0.001").times(DAI_DECIMALS).toFixed(),
			maxAmount: BigNumber("300").times(DAI_DECIMALS).toFixed()
		},
		{
			name: 'USDC',
			minAmount: BigNumber("0.001").times(DAI_DECIMALS).toFixed(),
			maxAmount: BigNumber("300").times(DAI_DECIMALS).toFixed()
		},
		{
			name: 'SAI',
			minAmount: BigNumber("0.001").times(DAI_DECIMALS).toFixed(),
			maxAmount: BigNumber("300").times(DAI_DECIMALS).toFixed()
		},
		{
			name: 'WETH', // Used to send Ether to the receiver in a post action.
			minAmount: BigNumber("0.0001").times(DECIMALS).toFixed(),
			maxAmount: BigNumber("3").times(DECIMALS).toFixed()
		}
    ],
	contracts: {
		StablePay: '0x382eA62768CDD573A48126eC4d852f5f9fC763Ef',
		StablePayStorage: '0x91564c02ff29bfb615e06Cd187026b8DEC59fe3B',
		Settings: '0xF4d6EDeC36b64eCe0a4b622C8750cb008439C3E8',
		Vault: '0xf8c354B22a9F4D5b638CCBF4432fEA146B748A83',
		KyberSwappingProvider: '0xccBba3B1Cb540F32DdB401451C7002B1019378C3',
		UniswapSwappingProvider: '0x12De56E442ed6413f2A16Aa00B162c2D5E8E55e3',
		DexAgSwappingProvider: '0x9f6d88C88786894b7FeE5c9BF1E82c65D2128688',
		TransferToPostAction: '0x45E6eAeAF0030bfAA6EDCCB3bDb855d2d73921dC',
		PostActionRegistry: '0xe70040A13D6408Ce5bFBef66a7f141CE64d5cfEC',
		Storage: '0xBFaD15170776637F6D0A3996b2D078CC7290b1b3',
		Registration: '0x3F3f1E17C19F07864795C37300209d7c039C807e',
		CompoundSettings: '0x20B94CD471262e48E3990A7c44fa1d6c953b0aB3',
		CompoundMintPostAction: '0x99b36ca0Aa033ADd47fF5c0a867642b2b480437C',
		EtherTransferPostAction: '0x2b5F4E71A4B96bfdd7Cf586B7494D482D33120AC',
		Upgrade: '0x31051AD158E3f83B41b7b6B3d1cfFC6dF65de496',
	},
	providers: {
		Kyber: '0x4b796265724e6574776f726b5f76310000000000000000000000000000000000',
		Uniswap: '0x556e69737761705f763100000000000000000000000000000000000000000000'
	}
};
