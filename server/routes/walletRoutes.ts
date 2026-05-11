import express from "express";
import { getWallets, convertBalance } from "../controllers/walletController";
import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.post("/convert", convertBalance);
router.get("/:userId", getWallets);

export default router;
