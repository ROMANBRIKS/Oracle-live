import express from "express";
import db from "../config/db";
import auth from "../middleware/auth";
import admin from "../middleware/admin";
import { liquidityCheck } from "../utils/treasuryAI";
import { reconcileTransactions } from "../utils/reconciliationEngine";

const router = express.Router();

// Apply protection
router.use(auth);
router.use(admin);

router.get("/treasury", (req, res) => {
  try {
    const treasury = db.prepare("SELECT * FROM treasury").all() as any[];
    
    // Evaluate liquidity automatically via treasury AI engine
    const augmentedTreasury = treasury.map(item => {
      const check = liquidityCheck({
        hotWalletBalance: item.hot_wallet_balance,
        pendingWithdrawals: item.pending_withdrawals
      });
      return {
        ...item,
        low_liquidity: check.status === "LOW_LIQUIDITY" ? 1 : 0,
        ai_recommendation: check.action || "NONE"
      };
    });
    
    res.json(augmentedTreasury);
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

// Trigger automatic reconciliation action
router.post("/treasury/reconcile", async (req, res) => {
  try {
    const count = await reconcileTransactions();
    res.json({ success: true, reconciledTransactions: count });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Reconciliation failed", error: err.message });
  }
});

export default router;
