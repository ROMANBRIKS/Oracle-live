import express from "express";
import { getPKStatus, startPK, endPK } from "../controllers/pkController";
import { getIO } from "../socket/socketServer";

const router = express.Router();

router.get("/status/:battleId", getPKStatus);

router.post("/start", (req, res) => {
  const io = getIO();
  startPK(req, res, io);
});

router.post("/end/:battleId", (req, res) => {
  const io = getIO();
  endPK(req, res, io);
});

export default router;
