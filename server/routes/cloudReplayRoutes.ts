import express from "express";
import upload from "../utils/cloudUpload";
import db from "../config/db";
import { v4 as uuidv4 } from "uuid";

const router = express.Router();

// UPLOAD TO CLOUD (Replays/Recordings)
router.post("/upload", upload.single("video"), async (req, res) => {
  try {
    const { title, streamer_id, room_id, duration } = req.body;
    const file = req.file as any;

    if (!file) {
      return res.status(400).json({ message: "No video file provided" });
    }

    const recordingId = uuidv4();
    const replayUrl = file.location;
    const thumbnail = `https://picsum.photos/seed/${recordingId}/800/600`;

    db.prepare(`
      INSERT INTO stream_recordings (id, streamer_id, room_id, title, thumbnail, recording_url, duration, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(recordingId, streamer_id, room_id, title || `Replay from ${room_id}`, thumbnail, replayUrl, duration || 0, 'ready');

    const replay = db.prepare("SELECT * FROM stream_recordings WHERE id = ?").get(recordingId);

    res.json({
      success: true,
      replay,
    });
  } catch (err) {
    console.error("Cloud upload failed:", err);
    res.status(500).json({ message: "Upload failed", error: err instanceof Error ? err.message : String(err) });
  }
});

// GET ALL REPLAYS
router.get("/all", (req, res) => {
  try {
    const replays = db.prepare(`
      SELECT r.*, u.username as streamer_name, u.avatar as streamer_avatar
      FROM stream_recordings r
      JOIN users u ON r.streamer_id = u.id
      ORDER BY r.created_at DESC
    `).all();
    res.json(replays);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch replays" });
  }
});

export default router;
