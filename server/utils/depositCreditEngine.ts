import db from "../config/db";

export interface CreditDepositParams {
  userId: string;
  amount: number;
  chainOrCurrency: string; // 'TRON' | 'ETH' | 'SOL' | 'BTC' | 'BNB' | 'USDT' | etc.
}

export async function creditDeposit({
  userId,
  amount,
  chainOrCurrency,
}: CreditDepositParams) {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    if (!user) {
      console.error(`[CREDIT ENGINE] User ${userId} could not be found.`);
      return null;
    }

    // Map chain/currency token to corresponding DB columns
    const colMap: { [key: string]: string } = {
      "BTC": "crypto_btc",
      "ETH": "crypto_eth",
      "USDT": "crypto_usdt",
      "SOL": "crypto_sol",
      "BNB": "crypto_bnb",
      "TRON": "crypto_trx",
      "TRX": "crypto_trx"
    };

    const targetColumn = colMap[chainOrCurrency.toUpperCase()] || "crypto_usdt";

    db.prepare(`
      UPDATE users 
      SET ${targetColumn} = ${targetColumn} + ? 
      WHERE id = ?
    `).run(amount, userId);

    console.log(`[CREDIT ENGINE] Credited ${amount} ${chainOrCurrency} to user ${userId} (${targetColumn})`);
    
    return db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
  } catch (error) {
    console.error("[CREDIT ENGINE] Failed to credit deposit:", error);
    return null;
  }
}
