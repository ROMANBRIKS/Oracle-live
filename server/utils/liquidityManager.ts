
export const liquidityState = {
  fiatEnabled: true,
  cryptoEnabled: {
    BTC: true,
    ETH: true,
    USDT: true,
    TRX: true,
    SOL: true,
    BNB: true,
  },
};

export const liquidityBalances: { [key: string]: number | { [key: string]: number } } = {
  fiat: 10000,
  crypto: {
    BTC: 1,
    ETH: 5,
    USDT: 20000,
    TRX: 50000,
    SOL: 100,
    BNB: 20,
  },
};
