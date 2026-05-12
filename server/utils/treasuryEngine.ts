import db from "../config/db";

export async function checkLiquidity(currency: string) {
  try {
    let treasury = db.prepare("SELECT * FROM treasury WHERE currency = ?").get(currency) as any;

    if (!treasury) {
      db.prepare("INSERT INTO treasury (currency) VALUES (?)").run(currency);
      treasury = db.prepare("SELECT * FROM treasury WHERE currency = ?").get(currency) as any;
    }

    const minimum = Number(process.env.MIN_HOT_WALLET_USD) || 5000;

    // In a real app we'd convert hot_wallet_balance to USD if it's not already
    // For simplicity, we assume hot_wallet_balance is stored in its relative value or USD equivalence
    if (treasury.hot_wallet_balance < minimum) {
      db.prepare("UPDATE treasury SET low_liquidity = 1, updated_at = CURRENT_TIMESTAMP WHERE currency = ?")
        .run(currency);
      console.log(`⚠ LOW ${currency} LIQUIDITY`);
    } else {
      db.prepare("UPDATE treasury SET low_liquidity = 0, updated_at = CURRENT_TIMESTAMP WHERE currency = ?")
        .run(currency);
    }

    return db.prepare("SELECT * FROM treasury WHERE currency = ?").get(currency);
  } catch (err) {
    console.error("Liquidity check failed:", err);
    return null;
  }
}
