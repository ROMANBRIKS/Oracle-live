import express from "express";
import { liquidityBalances } from "../utils/liquidityManager";

const router = express.Router();

router.get("/overview", (req, res) => {
  try {
    // In a real app, these might be fetched from on-chain balances
    res.json({
      hotWallets: liquidityBalances,
      coldWallets: {
        BTC: 4.82,
        ETH: 21.5,
        USDT: 540200,
        USDC: 120500,
        TRX: 2500000,
        SOL: 840,
        BNB: 312,
      },
      lastAudit: new Date().toISOString(),
      treasuryStatus: "stable",
      backingRatio: "114%"
    });
  } catch (err) {
    res.status(500).json({ message: "Treasury load failed" });
  }
});

export default router;
