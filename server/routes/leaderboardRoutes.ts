import express from "express";
import db from "../config/db";

const router = express.Router();

// Fetch rankings by type and timeframe
router.get("/:timeframe/:type", (req, res) => {
  const { timeframe, type } = req.params;
  const validTypes = ['streamer', 'gifter', 'agency'];
  const validTimeframes = ['daily', 'weekly', 'monthly', 'global'];

  if (!validTypes.includes(type) || !validTimeframes.includes(timeframe)) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const column = `${timeframe}_points`;
  
  try {
    const data = db.prepare(`
      SELECT l.*, u.username, u.avatar 
      FROM leaderboards l
      JOIN users u ON l.user_id = u.id
      WHERE l.type = ?
      ORDER BY l.${column} DESC
      LIMIT 100
    `).all(type);

    res.json(data);
  } catch (err) {
    console.error("Leaderboard Fetch Error:", err);
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
});

export default router;
