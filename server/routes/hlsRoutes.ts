import express from "express";
import db from "../config/db";
import { createHlsStream } from "../utils/hlsEngine";

const router = express.Router();

// CREATE OR START HLS STREAM
router.post("/create", async (req, res) => {
  try {
    const { roomId, streamerId } = req.body;

    const hlsResult = await createHlsStream(roomId);

    if (!hlsResult.success) {
      return res.status(500).json({ message: hlsResult.message });
    }

    // Upsert the HLS stream record
    const existing = db.prepare("SELECT * FROM hls_streams WHERE room_id = ?").get(roomId) as any;

    if (existing) {
      db.prepare(`
        UPDATE hls_streams 
        SET status = 'live', hls_url = ?, quality_levels = ?, updated_at = CURRENT_TIMESTAMP
        WHERE room_id = ?
      `).run(hlsResult.hlsUrl, JSON.stringify(hlsResult.qualities), roomId);
    } else {
      db.prepare(`
        INSERT INTO hls_streams (room_id, streamer_id, hls_url, quality_levels, status)
        VALUES (?, ?, ?, ?, 'live')
      `).run(roomId, streamerId, hlsResult.hlsUrl, JSON.stringify(hlsResult.qualities));
    }

    const stream = db.prepare("SELECT * FROM hls_streams WHERE room_id = ?").get(roomId);
    res.json({ success: true, stream });
  } catch (err) {
    console.error("HLS Create Error:", err);
    res.status(500).json({ message: "Failed to create HLS stream" });
  }
});

// GET HLS STREAM DETAILS
router.get("/:roomId", (req, res) => {
  try {
    const { roomId } = req.params;
    const stream = db.prepare("SELECT * FROM hls_streams WHERE room_id = ?").get(roomId) as any;

    if (!stream) {
      return res.status(404).json({ message: "Stream not found" });
    }

    // Parse quality levels back to array
    if (stream.quality_levels) {
        stream.quality_levels = JSON.parse(stream.quality_levels);
    }

    res.json(stream);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stream" });
  }
});

export default router;
