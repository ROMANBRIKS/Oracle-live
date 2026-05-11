
import express from "express";
import db from "../config/db";
import { liquidityBalances } from "../utils/liquidityManager";
import { detectFraud } from "../utils/fraudDetector";

import { sendCrypto } from "../utils/blockchainEngine";

const router = express.Router();

// CREATE WITHDRAWAL
router.post("/request", async (req, res) => {
  try {
    const { userId, amount, currency, method, walletAddress } = req.body;

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // CHECK USER BALANCE based on currency
    const balanceKey = `crypto_${currency.toLowerCase()}`;
    const userBalance = user[balanceKey] || 0;

    if (userBalance < amount) {
      return res.status(400).json({ message: "Insufficient balance" });
    }

    // LOCK USER FUNDS
    const updateStmt = db.prepare(`UPDATE users SET ${balanceKey} = ${balanceKey} - ? WHERE id = ?`);
    updateStmt.run(amount, userId);

    // KYC Check
    const kyc = db.prepare("SELECT status FROM kyc_records WHERE user_id = ? AND status = 'approved'").get(userId);
    const isVerified = !!kyc;

    // Fraud Detection
    const fraudCheck = detectFraud({
      userId,
      amount,
      ip: req.ip || "unknown",
      kycVerified: isVerified
    });

    if (fraudCheck.blocked) {
      return res.status(403).json({ message: fraudCheck.reason });
    }

    // CHECK LIQUIDITY
    const cryptoBalances = liquidityBalances.crypto as { [key: string]: number };
    const available = cryptoBalances[currency.toUpperCase()] || 0;

    let status = "processing";
    let message = "Withdrawal processing";
    let txHash: string | undefined;

    if (available < amount) {
      status = "queued";
      message = "Withdrawal queued. Processing may take longer than usual.";
    } else {
      // TRIGGER BLOCKCHAIN ENGINE (MOCKED)
      const tx = await sendCrypto({
        userId,
        currency,
        amount,
        walletAddress
      });

      if (tx.success) {
        txHash = tx.txHash;
        status = "completed";
        message = "Withdrawal completed successfully";
        
        // REDUCE LIQUIDITY immediately if processed
        cryptoBalances[currency.toUpperCase()] -= amount;
      } else {
        // Fallback to manual if engine fails
        status = "pending_manual";
        message = "Withdrawal pending manual review";
      }
    }

    // CREATE REQUEST
    const insertStmt = db.prepare(`
      INSERT INTO withdrawals (user_id, amount, currency, method, wallet_address, status, tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = insertStmt.run(userId, amount, currency, method, walletAddress, status, txHash || null);

    // Log transaction
    db.prepare(`
      INSERT INTO transactions (user_id, amount, type, status, currency, wallet_address, tx_hash)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(userId, amount, "withdrawal", status, currency, walletAddress, txHash || null);

    // Create Notification
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(userId, "Withdrawal Submitted", message, "withdrawal");

    res.json({
      success: true,
      message,
      withdrawalId: result.lastInsertRowid,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Withdrawal failed" });
  }
});

// ADMIN REFILL
router.post("/admin/refill", async (req, res) => {
  const { currency, amount } = req.body;
  const cryptoBalances = liquidityBalances.crypto as { [key: string]: number };
  
  if (cryptoBalances[currency.toUpperCase()] !== undefined) {
    cryptoBalances[currency.toUpperCase()] += amount;
  }

  res.json({
    success: true,
    liquidity: cryptoBalances[currency.toUpperCase()],
  });
});

// GET USER WITHDRAWALS
router.get("/user/:userId", (req, res) => {
  const withdrawals = db.prepare("SELECT * FROM withdrawals WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
  res.json(withdrawals);
});

export default router;
