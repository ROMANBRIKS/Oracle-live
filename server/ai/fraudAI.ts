export interface FraudScoreParams {
  failedPayments: number;
  suspiciousLogins: number;
  rapidWithdrawals: number;
}

export function fraudScore({
  failedPayments,
  suspiciousLogins,
  rapidWithdrawals,
}: FraudScoreParams): number {
  return (
    (failedPayments || 0) * 20 +
    (suspiciousLogins || 0) * 30 +
    (rapidWithdrawals || 0) * 50
  );
}
