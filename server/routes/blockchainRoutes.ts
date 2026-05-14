import express from "express";
import db from "../config/db";
import crypto from "crypto";
import { broadcastWithdrawal } from "../blockchain/withdrawalBroadcaster";
import { sweepToColdWallet } from "../utils/treasurySweep";
import { creditDeposit } from "../utils/depositCreditEngine";
import { BlockchainDeposit } from "../models/BlockchainDeposit";

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

// WITHDRAW BROADCASTER
router.post("/withdraw", async (req, res) => {
  try {
    const { chain, to, amount, userId } = req.body;
    
    // Broadcast on-chain
    const tx = await broadcastWithdrawal({ chain, to, amount });
    
    // Log the transaction in blockchain_transactions
    if (userId) {
      db.prepare(`
        INSERT INTO blockchain_transactions (user_id, currency, amount, wallet_address, tx_hash, network, status, type)
        VALUES (?, ?, ?, ?, ?, ?, 'confirmed', 'withdrawal')
      `).run(userId, chain, amount, to, tx.txHash, chain);
      
      // Also decrement corresponding user balance
      const colMap: { [key: string]: string } = {
        "BTC": "crypto_btc",
        "ETH": "crypto_eth",
        "USDT": "crypto_usdt",
        "SOL": "crypto_sol",
        "BNB": "crypto_bnb",
        "TRON": "crypto_trx",
        "TRX": "crypto_trx"
      };
      
      const targetColumn = colMap[chain.toUpperCase()] || "crypto_usdt";
      db.prepare(`
        UPDATE users 
        SET ${targetColumn} = MAX(0, ${targetColumn} - ?) 
        WHERE id = ?
      `).run(amount, userId);
    }

    res.json({
      success: true,
      tx,
    });
  } catch (err: any) {
    console.error("Blockchain withdrawal error:", err);
    res.status(500).json({
      message: "Withdrawal failed: " + err.message,
    });
  }
});

// TREASURY SWEEP
router.post("/sweep", async (req, res) => {
  try {
    const { chain, amount } = req.body;
    const result = await sweepToColdWallet({ chain, amount });
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// SIMULATE DEPOSIT (great for testing)
router.post("/simulate-deposit", async (req, res) => {
  try {
    const { userId, chain, address, amount } = req.body;
    
    const txHash = "0x" + crypto.randomBytes(32).toString("hex");
    
    // Create pending deposit
    const deposit = await BlockchainDeposit.create({
      userId,
      walletAddress: address,
      chain,
      txHash,
      amount,
      confirmations: 0,
      status: "pending"
    });
    
    // Set 12 confirmations immediately and credit
    deposit.confirmations = 12;
    deposit.status = "confirmed";
    await deposit.save();
    
    // Credit user crypto balance in users table
    const updatedUser = await creditDeposit({
      userId,
      amount,
      chainOrCurrency: chain
    });
    
    res.json({
      success: true,
      deposit,
      user: updatedUser
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
