import db from "../config/db";

export const getWallets = (req: any, res: any) => {
  let { userId } = req.params;
  
  // If userId in params is "me" or null, use the one from token
  if (!userId || userId === "me") {
    userId = req.user?.userId;
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    if (!user) {
      // Log for server-side debugging (visible in logs if reachable)
      console.error(`Wallet fetch failed: User ${userId} not found in DB`);
      return res.status(404).json({ 
        error: "User not found", 
        userId,
        sessionUserId: req.user?.userId 
      });
    }

    res.json({
      coins: user.coins || 0,
      earnings: user.earnings_balance || 0,
      fiat: {
        usd: user.fiat_usd || 0,
        ghs: user.fiat_ghs || 0
      },
      crypto: {
        btc: user.crypto_btc || 0,
        eth: user.crypto_eth || 0,
        usdt: user.crypto_usdt || 0,
        sol: user.crypto_sol || 0,
        bnb: user.crypto_bnb || 0,
        trx: user.crypto_trx || 0
      }
    });
  } catch (error: any) {
    console.error("Wallet Balance Error:", error);
    res.status(500).json({ error: "Failed to fetch wallet balances", details: error.message });
  }
};

export const convertBalance = (req: any, res: any) => {
  const { userId, from, to, amount } = req.body;
  // This is a placeholder for conversion logic
  // e.g., converting earnings to coins or crypto to coins
  try {
    // In a real app, you'd check exchange rates
    // For now, let's just implement a simple earnings -> coins conversion (1 earning = 100 coins)
    if (from === "earnings" && to === "coins") {
      const user = db.prepare("SELECT earnings_balance, coins FROM users WHERE id = ?").get(userId) as any;
      if (user.earnings_balance < amount) {
        return res.status(400).json({ error: "Insufficient earnings" });
      }

      const coinsToAdd = amount * 100;
      db.prepare("UPDATE users SET earnings_balance = earnings_balance - ?, coins = coins + ? WHERE id = ?")
        .run(amount, coinsToAdd, userId);

      db.prepare(`
        INSERT INTO transactions (user_id, amount, type, status, provider)
        VALUES (?, ?, ?, ?, ?)
      `).run(userId, amount, "conversion_earnings_to_coins", "success", "internal");

      return res.json({ success: true, message: `Converted ${amount} earnings to ${coinsToAdd} coins` });
    }

    res.status(400).json({ error: "Unsupported conversion type" });
  } catch (error) {
    res.status(500).json({ error: "Conversion failed" });
  }
};
