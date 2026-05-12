import express from "express";
import { getAllGifts, sendGift } from "../controllers/giftController";
import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

router.get("/all", getAllGifts);
router.post("/send", sendGift);

export default router;
