import db from "../config/db";

interface DepositParams {
  userId: string;
  currency: string;
  amount: number;
}

export async function processDeposit({ userId, currency, amount }: DepositParams) {
  try {
    let wallet = db.prepare("SELECT * FROM creator_wallets WHERE user_id = ?").get(userId) as any;

    if (!wallet) {
      db.prepare("INSERT INTO creator_wallets (user_id) VALUES (?)").run(userId);
      wallet = db.prepare("SELECT * FROM creator_wallets WHERE user_id = ?").get(userId) as any;
    }

    const fieldMap: Record<string, string> = {
      usdt: "crypto_usdt",
      btc: "crypto_btc",
      eth: "crypto_eth",
      trx: "crypto_trx",
      bnb: "crypto_bnb",
      sol: "crypto_sol",
    };

    const dbField = fieldMap[currency.toLowerCase()];

    if (dbField) {
      db.prepare(`UPDATE creator_wallets SET ${dbField} = ${dbField} + ?, updated_at = CURRENT_TIMESTAMP WHERE user_id = ?`)
        .run(amount, userId);
    }

    // Also update main user table if they share these fields (older architecture)
    try {
        db.prepare(`UPDATE users SET ${dbField} = ${dbField} + ? WHERE id = ?`)
          .run(amount, userId);
    } catch (e) {}

    return db.prepare("SELECT * FROM creator_wallets WHERE user_id = ?").get(userId);
  } catch (err) {
    console.error("Deposit processing failed:", err);
    return null;
  }
}
