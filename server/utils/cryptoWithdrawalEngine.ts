import db from "../config/db";

export async function processCryptoWithdrawal(withdrawalId: number | string) {
  try {
    const withdrawal = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(withdrawalId) as any;

    if (!withdrawal) return null;

    const currency = withdrawal.crypto_type || withdrawal.currency;
    let treasury = db.prepare("SELECT * FROM treasury WHERE currency = ?").get(currency) as any;

    if (!treasury) {
        db.prepare("INSERT INTO treasury (currency) VALUES (?)").run(currency);
        treasury = db.prepare("SELECT * FROM treasury WHERE currency = ?").get(currency) as any;
    }

    // Check liquidity
    if (treasury.hot_wallet_balance < withdrawal.amount) {
      db.prepare(`
        UPDATE withdrawals 
        SET status = 'on_hold', 
            admin_note = 'Processing delay. Liquidity balancing in progress.' 
        WHERE id = ?
      `).run(withdrawalId);
      
      return db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(withdrawalId);
    }

    // Process from treasury
    db.prepare(`
      UPDATE treasury 
      SET hot_wallet_balance = hot_wallet_balance - ?, 
          pending_withdrawals = pending_withdrawals + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE currency = ?
    `).run(withdrawal.amount, withdrawal.amount, currency);

    db.prepare("UPDATE withdrawals SET status = 'processing' WHERE id = ?")
      .run(withdrawalId);

    // REAL BLOCKCHAIN SIGNING LOGIC WOULD GO HERE IN FUTURE PHASES
    
    return db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(withdrawalId);
  } catch (err) {
    console.error("Crypto withdrawal processing failed:", err);
    return null;
  }
}
