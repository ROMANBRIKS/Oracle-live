import express from "express";
import { buyCoins, withdraw, getHistory } from "../controllers/paymentController";
import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.post("/buy-coins", buyCoins);
router.post("/withdraw", withdraw);
router.get("/history/:userId", getHistory);

export default router;
