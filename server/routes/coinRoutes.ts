import express from "express";
import { getCoins, buyCoins, spendCoins } from "../controllers/coinController";
import auth from "../middleware/auth";

const router = express.Router();

router.get("/:userId", auth, getCoins);
router.post("/buy", auth, buyCoins);
router.post("/spend", auth, spendCoins);

export default router;
