import express from "express";
import db from "../config/db";
import auth from "../middleware/auth";
import admin from "../middleware/admin";

const router = express.Router();

// Apply protection
router.use(auth);
router.use(admin);

router.get("/treasury", (req, res) => {
  try {
    const treasury = db.prepare("SELECT * FROM treasury").all();
    res.json(treasury);
  } catch (err: any) {
    console.error("Failed to load treasury archive:", err);
    res.status(500).json({ message: "Failed to load treasury data", error: err.message });
  }
});

// Update treasury manually (for admin testing/refills)
router.post("/treasury/refill", (req, res) => {
    try {
        const { currency, amount, type } = req.body;
        if (!currency || !amount) return res.status(400).json({ message: "Invalid parameters" });

        const field = type === 'cold' ? 'cold_wallet_balance' : 'hot_wallet_balance';
        
        db.prepare(`
            INSERT INTO treasury (currency, ${field}) 
            VALUES (?, ?)
            ON CONFLICT(currency) DO UPDATE SET ${field} = ${field} + ?, updated_at = CURRENT_TIMESTAMP
        `).run(currency, amount, amount);

        res.json({ success: true });
    } catch (err: any) {
        res.status(500).json({ message: "Refill failed", error: err.message });
    }
});

export default router;
