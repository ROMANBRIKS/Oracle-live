import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import db from "../config/db";
import { convertToHLS } from "../utils/recordingEngine";
import auth from "../middleware/auth";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// Ensure directories exist
const uploadDir = path.join(process.cwd(), "uploads");
const clipDir = path.join(process.cwd(), "public", "clips");

if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
if (!fs.existsSync(clipDir)) fs.mkdirSync(clipDir, { recursive: true });

/**
 * Upload a captured clip (10-15s) and convert to HLS
 */
router.post("/upload", auth, upload.single("video"), async (req: any, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No clip file provided" });
    }

    const { roomId, title, duration } = req.body;
    const streamerId = req.user.userId;
    
    // We strictly limit storage to clips only
    const fileName = `clip_${Date.now()}`;
    const outputDir = path.join(clipDir, fileName);
    if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
    
    const outputPath = path.join(outputDir, "index.m3u8");
    const relativeUrl = `clips/${fileName}/index.m3u8`;

    // Process conversion
    await convertToHLS({
      input: req.file.path,
      output: outputPath,
    });

    // Cleanup raw upload
    fs.unlinkSync(req.file.path);

    const result = db.prepare(`
        INSERT INTO stream_clips (streamer_id, room_id, title, clip_url, duration)
        VALUES (?, ?, ?, ?, ?)
    `).run(streamerId, roomId, title || "New Moment", relativeUrl, duration || 15);

    const clipId = result.lastInsertRowid;
    const clip = db.prepare("SELECT * FROM stream_clips WHERE id = ?").get(clipId);

    res.json({
      success: true,
      clip,
    });
  } catch (err: any) {
    console.error("Clip upload failed:", err);
    res.status(500).json({ message: "Clip processing failed", error: err.message });
  }
});

/**
 * Fetch all shared clips
 */
router.get("/all", async (req, res) => {
  try {
    const clips = db.prepare(`
      SELECT c.*, u.username as streamer_name, u.avatar as streamer_avatar
      FROM stream_clips c
      LEFT JOIN users u ON c.streamer_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 50
    `).all();

    res.json(clips);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to load clips" });
  }
});

/**
 * Get clips for a specific creator
 */
router.get("/creator/:userId", async (req, res) => {
    try {
        const clips = db.prepare(`
            SELECT * FROM stream_clips 
            WHERE streamer_id = ? 
            ORDER BY created_at DESC
        `).all(req.params.userId);
        res.json(clips);
    } catch (err) {
        res.status(500).json({ message: "Failed to fetch creator clips" });
    }
});

export default router;
