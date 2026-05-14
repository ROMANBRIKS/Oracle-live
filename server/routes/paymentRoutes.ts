import express from "express";
import { buyCoins, withdraw, getHistory } from "../controllers/paymentController";
import { createDeposit, createWithdrawal } from "../utils/paymentOrchestrator";
import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.post("/buy-coins", buyCoins);
router.post("/withdraw", withdraw);
router.get("/history/:userId", getHistory);

// Phase 8.1 - Orchestrated Payments Gateways
router.post("/deposit", async (req: any, res: any) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const tx = await createDeposit({
      userId,
      amount: req.body.amount,
      currency: req.body.currency || "USD",
      method: req.body.method,
    });
    res.json({ success: true, tx });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Deposit onboarding failed: " + err.message });
  }
});

router.post("/orchestrated/withdraw", async (req: any, res: any) => {
  try {
    const userId = req.user?.userId || req.body.userId;
    const tx = await createWithdrawal({
      userId,
      amount: req.body.amount,
      currency: req.body.currency || "USD",
      method: req.body.method,
    });
    res.json({ success: true, tx });
  } catch (err: any) {
    res.status(500).json({ success: false, message: "Withdrawal orchestration failed: " + err.message });
  }
});

export default router;
