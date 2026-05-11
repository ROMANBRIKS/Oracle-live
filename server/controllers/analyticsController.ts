import db from "../config/db";

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

export const getCreatorAnalytics = (req: any, res: any) => {
  const { streamerId } = req.params;
  try {
    const stmt = db.prepare("SELECT * FROM analytics WHERE streamer_id = ? ORDER BY created_at DESC");
    const analytics = stmt.all(streamerId);
    res.json(analytics);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch analytics" });
  }
};
