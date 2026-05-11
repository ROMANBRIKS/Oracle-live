
import express from "express";
import db from "../config/db";
import { liquidityBalances } from "../utils/liquidityManager";

const router = express.Router();

// GET ALL WITHDRAWALS
router.get("/all", (req, res) => {
  try {
    const withdrawals = db.prepare(`
      SELECT w.*, u.username 
      FROM withdrawals w 
      JOIN users u ON w.user_id = u.id 
      ORDER BY w.created_at DESC
    `).all();
    res.json(withdrawals);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch withdrawals" });
  }
});

// APPROVE WITHDRAWAL
router.post("/approve/:id", (req, res) => {
  try {
    const withdrawal = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(req.params.id) as any;
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    db.prepare("UPDATE withdrawals SET status = 'processing' WHERE id = ?").run(req.params.id);
    
    // Update linked transaction status
    db.prepare("UPDATE transactions SET status = 'processing' WHERE user_id = ? AND amount = ? AND type = 'withdrawal' AND status = ?")
      .run(withdrawal.user_id, withdrawal.amount, withdrawal.status);

    res.json({ success: true, message: "Withdrawal approved" });

    // Create Notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(withdrawal.user_id, "Withdrawal Approved", `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been approved and is being processed.`, "withdrawal");
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

// COMPLETE WITHDRAWAL
router.post("/complete/:id", (req, res) => {
  try {
    const withdrawal = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(req.params.id) as any;
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    // REDUCE LIQUIDITY
    const cryptoBalances = liquidityBalances.crypto as { [key: string]: number };
    if (cryptoBalances[withdrawal.currency.toUpperCase()] !== undefined) {
      cryptoBalances[withdrawal.currency.toUpperCase()] -= withdrawal.amount;
    }

    db.prepare("UPDATE withdrawals SET status = 'completed' WHERE id = ?").run(req.params.id);
    
    // Update user stats
    db.prepare("UPDATE users SET total_spent = total_spent + ? WHERE id = ?").run(withdrawal.amount, withdrawal.user_id);

    // Update linked transaction status
    db.prepare("UPDATE transactions SET status = 'completed' WHERE user_id = ? AND amount = ? AND type = 'withdrawal' AND status = ?")
      .run(withdrawal.user_id, withdrawal.amount, withdrawal.status);

    res.json({ success: true, message: "Withdrawal completed" });

    // Create Notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(withdrawal.user_id, "Withdrawal Completed", `Success! Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} has been sent to your wallet.`, "withdrawal");
  } catch (err) {
    res.status(500).json({ message: "Completion failed" });
  }
});

// REJECT WITHDRAWAL
router.post("/reject/:id", (req, res) => {
  try {
    const withdrawal = db.prepare("SELECT * FROM withdrawals WHERE id = ?").get(req.params.id) as any;
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found" });
    }

    // REFUND FUNDS
    const balanceKey = `crypto_${withdrawal.currency.toLowerCase()}`;
    db.prepare(`UPDATE users SET ${balanceKey} = ${balanceKey} + ? WHERE id = ?`).run(withdrawal.amount, withdrawal.user_id);

    db.prepare("UPDATE withdrawals SET status = 'rejected', admin_note = 'Rejected by admin' WHERE id = ?").run(req.params.id);

    // Update linked transaction status
    db.prepare("UPDATE transactions SET status = 'rejected' WHERE user_id = ? AND amount = ? AND type = 'withdrawal' AND status = ?")
      .run(withdrawal.user_id, withdrawal.amount, withdrawal.status);

    res.json({ success: true, message: "Withdrawal rejected" });

    // Create Notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(withdrawal.user_id, "Withdrawal Rejected", `Your withdrawal of ${withdrawal.amount} ${withdrawal.currency} was rejected. Funds have been returned to your balance.`, "security");
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

export default router;
