import db from "../config/db";

export const getCoins = (req: any, res: any) => {
  let user = db.prepare("SELECT * FROM users WHERE id = ? OR username = ?").get(req.params.userId, req.params.userId) as any;
  if (!user) {
    const id = req.params.userId;
    db.prepare("INSERT OR IGNORE INTO users (id, username, coins) VALUES (?, ?, ?)").run(id, id, 1000);
    user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as any;
  }
  res.json({ coins: user?.coins || 0 });
};

export const buyCoins = async (req: any, res: any) => {
  const { userId, amount } = req.body;
  try {
    // Basic mock payment check logic
    db.prepare("UPDATE users SET coins = coins + ? WHERE id = ? OR username = ?").run(amount, userId, userId);
    db.prepare("INSERT INTO transactions (user_id, amount, type, status, provider) VALUES (?, ?, ?, ?, ?)").run(userId, amount, "purchase", "success", "mock");
    
    const user = db.prepare("SELECT * FROM users WHERE id = ? OR username = ?").get(userId, userId) as any;
    res.json({ 
      message: "Refill successful", 
      coins: user.coins,
      paymentMode: "MOCK" 
    });
  } catch (error) {
    res.status(500).json({ error: "Payment processing failed" });
  }
};

export const spendCoins = (req: any, res: any) => {
  const { userId, amount } = req.body;
  const user = db.prepare("SELECT * FROM users WHERE id = ? OR username = ?").get(userId, userId) as any;
  
  if (!user || user.coins < amount) {
    return res.status(400).json({ error: "Not enough coins" });
  }

  db.prepare("UPDATE users SET coins = coins - ? WHERE id = ?").run(amount, user.id);
  res.json({ coins: user.coins - amount });
};
