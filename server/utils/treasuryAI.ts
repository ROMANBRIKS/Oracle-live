export interface LiquidityCheckParams {
  hotWalletBalance: number;
  pendingWithdrawals: number;
}

export function liquidityCheck({
  hotWalletBalance,
  pendingWithdrawals,
}: LiquidityCheckParams) {
  if (pendingWithdrawals === 0) {
    return {
      status: "HEALTHY",
    };
  }

  const ratio = hotWalletBalance / pendingWithdrawals;

  if (ratio < 1.2) {
    return {
      status: "LOW_LIQUIDITY",
      action: "REFILL_HOT_WALLET",
    };
  }

  return {
    status: "HEALTHY",
  };
}
