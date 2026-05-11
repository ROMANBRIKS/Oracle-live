import db from "../config/db";

export const buyCoins = (req: any, res: any) => {
  const { userId, amount } = req.body;
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const newCoins = user.coins + amount;
    db.prepare("UPDATE users SET coins = ? WHERE id = ?").run(newCoins, userId);

    db.prepare(`
      INSERT INTO transactions (user_id, amount, type, status, provider)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, amount, "coin_purchase", "success", "mock");

    res.json({ success: true, coins: newCoins, mode: "mock" });
  } catch (error) {
    res.status(500).json({ error: "Failed to buy coins" });
  }
};

export const withdraw = (req: any, res: any) => {
  const { userId, amount } = req.body;
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId);
    if (!user || user.coins < amount) {
      return res.status(400).json({ error: "Insufficient funds" });
    }

    // In a real app, you'd reduce coins here if it's instant, 
    // or wait for approval. For this mock, we'll just record it.
    
    db.prepare(`
      INSERT INTO transactions (user_id, amount, type, status, provider)
      VALUES (?, ?, ?, ?, ?)
    `).run(userId, amount, "withdrawal", "pending", "mock");

    res.json({ success: true, mode: "mock", message: "Withdrawal request submitted" });
  } catch (error) {
    res.status(500).json({ error: "Withdrawal failed" });
  }
};

export const getHistory = (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const history = db.prepare("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC").all(userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch history" });
  }
};
