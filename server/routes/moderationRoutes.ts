import express from "express";
import db from "../config/db";
import { moderateMessage } from "../utils/moderationEngine";

const router = express.Router();

// MODERATE MESSAGE
router.post("/message", async (req, res) => {
  try {
    const result = await moderateMessage(req.body);
    res.json(result);
  } catch (err: any) {
    console.error("Moderation failed:", err);
    res.status(500).json({
      message: "Moderation failed",
      error: err.message
    });
  }
});

// GET LOGS
router.get("/logs/:roomId", async (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT m.*, u.username 
      FROM moderation_logs m 
      LEFT JOIN users u ON m.user_id = u.id 
      WHERE m.room_id = ? 
      ORDER BY m.created_at DESC
    `).all(req.params.roomId);
    
    res.json(logs);
  } catch (err: any) {
    console.error("Failed to fetch logs:", err);
    res.status(500).json({
      message: "Failed to fetch logs",
      error: err.message
    });
  }
});

export default router;
