import db from "../config/db";

export interface SweepParams {
  chain: string; // 'TRON' | 'ETH' | 'SOL' | 'BTC' | 'BNB' | etc.
  amount: number;
}

export async function sweepToColdWallet({
  chain,
  amount,
}: SweepParams) {
  console.log(`[TREASURY SWEEP] Sweeping ${amount} ${chain} to cold storage`);

  try {
    const currency = chain.toUpperCase() === "TRON" ? "USDT" : chain.toUpperCase();
    const row = db.prepare("SELECT * FROM treasury WHERE currency = ?").get(currency) as any;
    
    if (row) {
      if (row.hot_wallet_balance < amount) {
        console.warn(`[SWEEP] Hot wallet has insufficient holdings (${row.hot_wallet_balance}) to sweep ${amount} ${currency}`);
        return { success: false, error: "Insufficient hot wallet balance" };
      }

      db.prepare(`
        UPDATE treasury 
        SET hot_wallet_balance = hot_wallet_balance - ?, 
            cold_wallet_balance = cold_wallet_balance + ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE currency = ?
      `).run(amount, amount, currency);

      console.log(`[SWEEP] Successfully relocated ${amount} ${currency} to secure cold-storage archive.`);
      return {
        success: true,
        chain: currency,
        amountSwept: amount,
        hotWalletBalance: row.hot_wallet_balance - amount,
        coldWalletBalance: row.cold_wallet_balance + amount
      };
    }
    
    return { success: false, error: `Currency ${currency} not monitored in local treasury.` };
  } catch (error) {
    console.error("[TREASURY SWEEP] Secure transfer failed:", error);
    return { success: false, error: "Database error during relocation" };
  }
}
