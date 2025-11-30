export const CONTRACT_ADDRESS = "0x6Fde11615C80251d394586CD185bb56449d74569";

export const ZETA_TESTNET = {
  chainId: "0x1b59",
  chainName: "ZetaChain Athens Testnet",
  nativeCurrency: {
    name: "ZETA",
    symbol: "ZETA",
    decimals: 18
  },
  rpcUrls: ["https://zetachain-athens-evm.blockpi.network/v1/rpc/public"],
  blockExplorerUrls: ["https://testnet.zetascan.com/"]
};

export const SUPPORTED_CHAINS = [
  { id: 1, name: "Solana", icon: "🟣" },
  { id: 2, name: "Sui", icon: "🔵" },
  { id: 3, name: "TON", icon: "💎" }
];

export const EXAMPLE_ADDRESSES = {
  solana: "7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU",
  sui: "0xdba1916cf68795d88436e9d12c21c0eda10bc012175db4e0bb774bd0fcddad4f",
  ton: "EQD4FPq-PRDieyQKkizFTRtSDyucUIqrj0v_zXJmqaDp6_0t",
  ethereum: "0xda49D74234318880a2b6af6BF76B390A55284e73"
};
