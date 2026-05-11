import express from "express";
import db from "../config/db";

const router = express.Router();

// USER TX HISTORY
router.get("/history/:userId", (req, res) => {
  try {
    const { userId } = req.params;
    const txs = db.prepare(`
      SELECT * FROM blockchain_transactions 
      WHERE user_id = ? 
      ORDER BY created_at DESC
    `).all(userId);

    res.json(txs);
  } catch (err) {
    console.error("Blockchain history error:", err);
    res.status(500).json({
      message: "Failed to fetch transactions",
    });
  }
});

export default router;
