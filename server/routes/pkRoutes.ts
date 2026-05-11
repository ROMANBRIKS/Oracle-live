import express from "express";
import { getPKStatus, startPK } from "../controllers/pkController";
import { getIO } from "../socket/socketServer";

const router = express.Router();

router.get("/status", getPKStatus);
router.post("/start", (req, res) => {
  const io = getIO();
  startPK(req, res, io);
});

export default router;
