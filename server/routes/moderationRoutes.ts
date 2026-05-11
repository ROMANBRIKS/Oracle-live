import express from "express";
import db from "../config/db";
import { getIO } from "../socket/socketServer";

const router = express.Router();

// KICK USER
router.post("/kick", (req, res) => {
  const { userId, roomId, username } = req.body;
  try {
    const io = getIO();
    io.to(roomId).emit("user_kicked", { userId, username, roomId });
    res.json({ success: true, message: `User ${username} kicked.` });
  } catch (err) {
    res.status(500).json({ message: "Kick failed" });
  }
});

// MUTE USER
router.post("/mute", (req, res) => {
  const { userId, username, roomId } = req.body;
  try {
    const io = getIO();
    io.to(roomId).emit("user_muted", { userId, username, roomId });
    // In database
    db.prepare("INSERT INTO mutes (user_id) VALUES (?) ON CONFLICT(user_id) DO NOTHING").run(userId);
    res.json({ success: true, message: `User ${username} muted.` });
  } catch (err) {
    res.status(500).json({ message: "Mute failed" });
  }
});

// BAN USER (Admin only)
router.post("/ban", (req, res) => {
  const { userId, username, reason, adminId } = req.body;
  try {
    const io = getIO();
    db.prepare("INSERT INTO bans (user_id, reason, admin_id) VALUES (?, ?, ?)").run(userId, reason, adminId);
    io.emit("user_banned", { userId, username });
    res.json({ success: true, message: `User ${username} banned permanently.` });
  } catch (err) {
    res.status(500).json({ message: "Ban failed" });
  }
});

export default router;
