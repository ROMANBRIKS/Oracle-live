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
    hotWallet: process.env.BTC_HOT_WALLET,
    privateKey: process.env.BTC_PRIVATE_KEY,
  },
  ETH: {
    symbol: "ETH",
    network: "ethereum",
    hotWallet: process.env.ETH_HOT_WALLET,
    privateKey: process.env.ETH_PRIVATE_KEY,
  },
  USDT: {
    symbol: "USDT",
    network: "tron",
    hotWallet: process.env.USDT_HOT_WALLET,
    privateKey: process.env.USDT_PRIVATE_KEY,
  },
  TRX: {
    symbol: "TRX",
    network: "tron",
    hotWallet: process.env.TRX_HOT_WALLET,
    privateKey: process.env.TRX_PRIVATE_KEY,
  },
  SOL: {
    symbol: "SOL",
    network: "solana",
    hotWallet: process.env.SOL_HOT_WALLET,
    privateKey: process.env.SOL_PRIVATE_KEY,
  },
  BNB: {
    symbol: "BNB",
    network: "bsc",
    hotWallet: process.env.BNB_HOT_WALLET,
    privateKey: process.env.BNB_PRIVATE_KEY,
  },
};

export default blockchainWallets;
