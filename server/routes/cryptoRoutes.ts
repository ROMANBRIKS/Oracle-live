import express from "express";
import { buyWithCrypto, cryptoWithdraw, updateWallets } from "../controllers/cryptoController";
import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.post("/buy-coins", buyWithCrypto);
router.post("/withdraw", cryptoWithdraw);
router.post("/update-wallets", updateWallets);

export default router;
