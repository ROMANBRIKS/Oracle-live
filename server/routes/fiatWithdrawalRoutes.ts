
import express from "express";
import db from "../config/db";
import { sendFiatPayout } from "../utils/paystackPayout";

const router = express.Router();

// FIAT WITHDRAWAL
router.post("/withdraw", async (req, res) => {
  try {
    const { userId, amount, accountNumber, bankCode, currency } = req.body;

    if (!userId || !amount || !accountNumber) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    const payout = await sendFiatPayout({
      amount,
      accountNumber,
      bankCode,
      currency,
    });

    if (!payout.success) {
      return res.status(500).json({
        message: payout.message,
      });
    }

    const stmt = db.prepare(`
      INSERT INTO fiat_transactions (user_id, amount, currency, account_number, bank_code, transfer_code, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const info = stmt.run(
      userId,
      amount,
      currency || "GHS",
      accountNumber,
      bankCode || "",
      payout.transferCode,
      payout.status
    );

    res.json({
      success: true,
      txId: info.lastInsertRowid,
      status: payout.status
    });
  } catch (err: any) {
    console.error("Fiat withdrawal route error:", err);
    res.status(500).json({
      message: "Fiat payout failed",
    });
  }
});

export default router;
