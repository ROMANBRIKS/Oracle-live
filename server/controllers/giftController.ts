import db from "../config/db";
import { updatePKScore } from "./pkController";
import { getIO } from "../socket/socketServer";
import { v4 as uuidv4 } from "uuid";
import { addPoints } from "../utils/leaderboardEngine";
import { updateAnalytics } from "../utils/analyticsEngine";
import { addStreamerRevenue } from "../utils/revenueEngine";
import { incrementGiftScore } from "../utils/recommendationEngine";

export const getAllGifts = (req: any, res: any) => {
  try {
    const gifts = db.prepare("SELECT * FROM gifts WHERE active = 1").all();
    
    // Seed default gifts if empty
    if (gifts.length === 0) {
      const defaultGifts = [
        { id: 'g1', name: 'Rose', price: 10, icon: '🌹', animation: 'https://cdn-icons-png.flaticon.com/512/3233/3233481.png', rarity: 'common' },
        { id: 'g2', name: 'Lion', price: 1000, icon: '🦁', animation: 'https://cdn-icons-png.flaticon.com/512/616/616412.png', rarity: 'legendary' },
        { id: 'g3', name: 'Diamond', price: 500, icon: '💎', animation: 'https://cdn-icons-png.flaticon.com/512/811/811327.png', rarity: 'epic' },
        { id: 'g4', name: 'Rocket', price: 5000, icon: '🚀', animation: 'https://cdn-icons-png.flaticon.com/512/1033/1033036.png', rarity: 'legendary' },
        { id: 'g5', name: 'Ice Cream', price: 5, icon: '🍦', animation: 'https://cdn-icons-png.flaticon.com/512/938/938063.png', rarity: 'common' }
      ];
      
      const insert = db.prepare("INSERT INTO gifts (id, name, price, icon, animation, rarity) VALUES (?, ?, ?, ?, ?, ?)");
      defaultGifts.forEach(g => insert.run(g.id, g.name, g.price, g.icon, g.animation, g.rarity));
      
      return res.json(defaultGifts);
    }
    
    res.json(gifts);
  } catch (err) {
    res.status(500).json({ error: "Failed to load gifts" });
  }
};

export const sendGift = async (req: any, res: any) => {
  const { senderId, receiverId, roomId, giftId, quantity = 1, side, battleId } = req.body;
  
  try {
    const gift = db.prepare("SELECT * FROM gifts WHERE id = ?").get(giftId) as any;
    if (!gift) return res.status(404).json({ error: "Gift not found" });

    const cost = gift.price * quantity;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(senderId) as any;
    
    if (!user || user.coins < cost) {
      return res.status(400).json({ error: "Not enough coins" });
    }

    // Atomic transaction simulation
    const tx = db.transaction(() => {
      // Deduct from sender
      db.prepare("UPDATE users SET coins = coins - ?, total_spent = total_spent + ? WHERE id = ?").run(cost, cost, senderId);
      
      // Credit receiver (80% share for now)
      const streamerShare = Math.floor(cost * 0.8);
      db.prepare("UPDATE users SET total_earned = total_earned + ? WHERE id = ?").run(streamerShare, receiverId);

      // Record Gift Transaction
      const txId = uuidv4();
      db.prepare(`
        INSERT INTO gift_transactions (id, sender_id, receiver_id, room_id, gift_id, quantity, total_coins)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(txId, senderId, receiverId, roomId, giftId, quantity, cost);
      
      // Record in general transactions
      db.prepare(`
        INSERT INTO transactions (user_id, amount, type, status)
        VALUES (?, ?, ?, ?)
      `).run(senderId, cost, 'gift_sent', 'success');

      return { txId, streamerShare };
    });

    const result = tx();

    // Award Leaderboard Points
    addPoints(receiverId, 'streamer', cost);
    addPoints(senderId, 'gifter', cost);

    const io = getIO();
    
    // PK Logic
    if (battleId && receiverId) {
        updatePKScore(battleId, receiverId, cost, io);
    }

    // Notify receiver
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(receiverId, "Gift Received! 🎁", `${user.username} sent you ${quantity}x ${gift.name}!`, "gift");

    // Emit to room
    io.to(roomId).emit("receive_gift", { 
        senderId, 
        senderName: user.username,
        giftName: gift.name, 
        animation: gift.animation,
        rarity: gift.rarity,
        quantity 
    });

    // PHASE 6.3 - Analytics
    try {
        await updateAnalytics({
            streamerId: receiverId,
            roomId,
            field: "totalGifts",
            value: quantity
        });
        await updateAnalytics({
            streamerId: receiverId,
            roomId,
            field: "totalCoins",
            value: cost
        });
    } catch (anErr) {
        console.error("Analytics update failed in gift flow:", anErr);
    }

    // PHASE 6.4 - Revenue
    try {
        // addStreamerRevenue({ streamerId: receiverId, coins: totalCoins });
        // cost is total_coins for this transaction (quantity * price)
        await addStreamerRevenue({
            streamerId: receiverId,
            coins: cost 
        });

        // PHASE 6.7 - AI Recommendation increment
        await incrementGiftScore(roomId, receiverId, cost);
    } catch (revErr) {
        console.error("Revenue update failed in gift flow:", revErr);
    }

    res.json({ success: true, newBalance: user.coins - cost });
  } catch (err: any) {
    console.error("Gift Send Error:", err);
    res.status(500).json({ error: "Failed to send gift", details: err.message });
  }
};
