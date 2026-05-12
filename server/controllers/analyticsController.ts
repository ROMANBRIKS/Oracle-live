import db from "../config/db";
import { v4 as uuidv4 } from "uuid";

// LEGACY (Keep for compatibility if any)
export const saveAnalytics = (req: any, res: any) => {
  const { streamerId, streamId, viewers, likes, gifts, earnings, followersGained } = req.body;
  try {
    const stmt = db.prepare(`
      INSERT INTO analytics (streamer_id, stream_id, viewers, likes, gifts, earnings, followers_gained)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const result = stmt.run(streamerId, streamId, viewers, likes, gifts, earnings, followersGained);
    res.json({ id: result.lastInsertRowid, message: "Analytics saved" });
  } catch (error) {
    res.status(500).json({ error: "Failed to save analytics" });
  }
};

// NEW STREAM ANALYTICS
export const startStreamAnalytics = (req: any, res: any) => {
  try {
    const { streamerId, roomId } = req.body;
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO stream_analytics (id, streamer_id, room_id)
      VALUES (?, ?, ?)
    `).run(id, streamerId, roomId);

    res.json({ success: true, id });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to start analytics", error: err.message });
  }
};

export const updateStreamAnalytics = (req: any, res: any) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    const fields = Object.keys(updates).map(key => `${key} = ?`).join(", ");
    const values = Object.values(updates);

    db.prepare(`
      UPDATE stream_analytics 
      SET ${fields}, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(...values, id);

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: "Analytics update failed", error: err.message });
  }
};

export const getCreatorAnalytics = (req: any, res: any) => {
  const { streamerId } = req.params;
  try {
    const analytics = db.prepare("SELECT * FROM stream_analytics WHERE streamer_id = ? ORDER BY created_at DESC").all(streamerId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
