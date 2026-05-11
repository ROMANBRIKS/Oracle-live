import db from "../config/db";
import { updatePKScore } from "./pkController";
import { getIO } from "../socket/socketServer";

export const sendGift = (req: any, res: any) => {
  const { userId, giftType, side } = req.body;
  const giftPrices: Record<string, number> = { rose: 10, lion: 100, car: 500 };
  const cost = giftPrices[giftType];

  if (!cost) return res.status(400).json({ error: "Invalid gift" });

  const user = db.prepare("SELECT * FROM users WHERE id = ? OR username = ?").get(userId, userId) as any;
  if (!user || user.coins < cost) {
    return res.status(400).json({ error: "Not enough coins" });
  }

  db.prepare("UPDATE users SET coins = coins - ?, total_spent = total_spent + ? WHERE id = ?").run(cost, cost, user.id);
  
  // For now we assume host1 is the recipient
  db.prepare("UPDATE users SET total_earned = total_earned + ? WHERE id = 'host1'").run(cost);

  // Record Transaction
  db.prepare(`
    INSERT INTO transactions (user_id, amount, type, status)
    VALUES (?, ?, ?, ?)
  `).run(user.id, cost, 'gift_sent', 'success');
  
  db.prepare(`
    INSERT INTO transactions (user_id, amount, type, status)
    VALUES (?, ?, ?, ?)
  `).run('host1', cost, 'gift_received', 'success');

  const io = getIO();
  
  // If PK is active, updating score. side 1 is host, side 2 is guest. Default to 1 if not specified
  updatePKScore(cost, (side === 2 ? 2 : 1), io);

  // Create Notification for recipient (hardcoded 'host1' for now)
  db.prepare(`
    INSERT INTO notifications (user_id, title, message, type)
    VALUES (?, ?, ?, ?)
  `).run('host1', "Gift Received! 🎁", `${userId} sent you a ${giftType}!`, "gift");

  io.emit("receive_gift", { user: userId, giftType });
  res.json({ coins: user.coins - cost });
};
