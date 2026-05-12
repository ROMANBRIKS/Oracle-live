import db from "../config/db";

export async function addStreamerRevenue({
  streamerId,
  coins,
}: {
  streamerId: string;
  coins: number;
}) {
  try {
    let wallet = db.prepare("SELECT * FROM creator_wallets WHERE user_id = ?").get(streamerId) as any;

    if (!wallet) {
      db.prepare(`
        INSERT INTO creator_wallets (user_id) VALUES (?)
      `).run(streamerId);
      wallet = db.prepare("SELECT * FROM creator_wallets WHERE user_id = ?").get(streamerId) as any;
    }

    // Rate: 1 coin = $0.005
    const usd = coins * 0.005;

    db.prepare(`
      UPDATE creator_wallets 
      SET coins = coins + ?, 
          diamonds = diamonds + ?, 
          total_earnings_usd = total_earnings_usd + ?, 
          pending_usd = pending_usd + ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(coins, coins, usd, usd, streamerId);

    return db.prepare("SELECT * FROM creator_wallets WHERE user_id = ?").get(streamerId);
  } catch (err) {
    console.error("Failed to add streamer revenue:", err);
    return null;
  }
}
