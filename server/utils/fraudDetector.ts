import db from "../config/db";

const suspiciousIPs = new Set<string>();
const flaggedUsers = new Set<string>();

const withdrawalLimits = {
  normal: 1000,
  verified: 5000,
};

interface DetectFraudParams {
  userId: string;
  amount: number;
  ip: string;
  kycVerified: boolean;
}

export function detectFraud({
  userId,
  amount,
  ip,
  kycVerified,
}: DetectFraudParams) {
  // Check if user is flagged in DB (if such a field exists, otherwise use the set)
  if (flaggedUsers.has(userId)) {
    return {
      blocked: true,
      reason: "User account flagged for investigation",
    };
  }

  // SUSPICIOUS IP
  if (suspiciousIPs.has(ip)) {
    return {
      blocked: true,
      reason: "Suspicious network activity detected",
    };
  }

  // LIMIT CHECK
  const limit = kycVerified ? withdrawalLimits.verified : withdrawalLimits.normal;

  if (amount > limit) {
    return {
      blocked: true,
      reason: kycVerified 
        ? "Withdrawal limit exceeded ($5,000 max for verified accounts)" 
        : "Standard limit exceeded ($1,000 max). Please complete KYC for higher limits.",
    };
  }

  // Velocity Check (Internal pattern)
  const recentWithdrawals = db.prepare(`
    SELECT COUNT(*) as count FROM withdrawals 
    WHERE user_id = ? AND created_at > datetime('now', '-24 hours')
  `).get(userId) as { count: number };

  if (recentWithdrawals.count > 3) {
    return {
      blocked: true,
      reason: "Daily withdrawal frequency limit reached (3 per 24h)"
    };
  }

  return {
    blocked: false,
  };
}

// Admin utilities
export function flagUser(userId: string) { flaggedUsers.add(userId); }
export function unflagUser(userId: string) { flaggedUsers.delete(userId); }
export function blockIP(ip: string) { suspiciousIPs.add(ip); }
