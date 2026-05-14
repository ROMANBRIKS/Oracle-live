import express from "express";
import db from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { shadowBan } from "../utils/shadowBanEngine";

const router = express.Router();

interface ModerationRequest {
    roomId: string;
    targetUserId: string;
    moderatorId: string;
    reason?: string;
    durationMinutes?: number;
}

// MUTE USER
router.post("/mute", (req, res) => {
  try {
    const { roomId, targetUserId, moderatorId, reason, durationMinutes } = req.body as ModerationRequest;
    const id = uuidv4();
    const expiresAt = durationMinutes ? new Date(Date.now() + durationMinutes * 60000).toISOString() : null;

    db.prepare(`
      INSERT INTO live_moderation (id, room_id, target_user_id, moderator_id, action, reason, expires_at)
      VALUES (?, ?, ?, ?, 'mute', ?, ?)
    `).run(id, roomId, targetUserId, moderatorId, reason || "No reason", expiresAt);

    res.json({ success: true, actionId: id });
  } catch (err: any) {
    res.status(500).json({ message: "Mute failed", error: err.message });
  }
});

// BAN USER
router.post("/ban", (req, res) => {
  try {
    const { roomId, targetUserId, moderatorId, reason } = req.body as ModerationRequest;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO live_moderation (id, room_id, target_user_id, moderator_id, action, reason)
      VALUES (?, ?, ?, ?, 'ban', ?)
    `).run(id, roomId, targetUserId, moderatorId, reason || "Violation of terms");

    res.json({ success: true, actionId: id });
  } catch (err: any) {
    res.status(500).json({ message: "Ban failed", error: err.message });
  }
});

// KICK USER
router.post("/kick", (req, res) => {
  try {
    const { roomId, targetUserId, moderatorId, reason } = req.body as ModerationRequest;
    const id = uuidv4();

    db.prepare(`
      INSERT INTO live_moderation (id, room_id, target_user_id, moderator_id, action, reason)
      VALUES (?, ?, ?, ?, 'kick', ?)
    `).run(id, roomId, targetUserId, moderatorId, reason || "Kicked by moderator");

    res.json({ success: true, actionId: id });
  } catch (err: any) {
    res.status(500).json({ message: "Kick failed", error: err.message });
  }
});

// SHADOW BAN
router.post("/shadow-ban", (req, res) => {
    try {
        const { targetUserId } = req.body;
        shadowBan(targetUserId);
        res.json({ success: true, message: "User shadow banned" });
    } catch (err: any) {
        res.status(500).json({ message: "Shadow ban failed" });
    }
});

export default router;
