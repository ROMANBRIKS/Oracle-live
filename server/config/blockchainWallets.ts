export interface WalletConfig {
  symbol: string;
  network: string;
  hotWallet?: string;
  privateKey?: string;
}

export const blockchainWallets: Record<string, WalletConfig> = {
  BTC: {
    symbol: "BTC",
    network: "bitcoin",
    hotWallet: process.env.BTC_HOT_WALLET || "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    privateKey: process.env.BTC_PRIVATE_KEY,
  },
  ETH: {
    symbol: "ETH",
    network: "ethereum",
    hotWallet: process.env.ETH_HOT_WALLET || "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
    privateKey: process.env.ETH_PRIVATE_KEY,
  },
  USDT: {
    symbol: "USDT",
    network: "tron",
    hotWallet: process.env.USDT_HOT_WALLET || "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    privateKey: process.env.USDT_PRIVATE_KEY,
  },
  TRX: {
    symbol: "TRX",
    network: "tron",
    hotWallet: process.env.TRX_HOT_WALLET || "TY6ky791Y72M65yr6Syr6Syr6Syr6Syr6S",
    privateKey: process.env.TRX_PRIVATE_KEY,
  },
  SOL: {
    symbol: "SOL",
    network: "solana",
    hotWallet: process.env.SOL_HOT_WALLET || "H6AR6yM2AUU1r2YREUf0T932X5X7X5X7X5X7X5X7X5X",
    privateKey: process.env.SOL_PRIVATE_KEY,
  },
  BNB: {
    symbol: "BNB",
    network: "bsc",
    hotWallet: process.env.BNB_HOT_WALLET || "0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c",
    privateKey: process.env.BNB_PRIVATE_KEY,
  },
};

export default blockchainWallets;
