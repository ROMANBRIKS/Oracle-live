import express from "express";
import db from "../config/db";

const router = express.Router();

// Fetch rankings by type/category and timeframe
router.get("/:timeframe/:category", (req, res) => {
  const { timeframe, category } = req.params;
  
  // Mapping for frontend consistency
  const categoryMap: Record<string, string> = {
    'top_streamer': 'streamer',
    'top_gifter': 'gifter',
    'streamer': 'streamer',
    'gifter': 'gifter',
    'agency': 'agency'
  };

  const type = categoryMap[category] || category;
  const validTypes = ['streamer', 'gifter', 'agency'];
  const validTimeframes = ['daily', 'weekly', 'monthly', 'global'];

  if (!validTypes.includes(type) || !validTimeframes.includes(timeframe)) {
    return res.status(400).json({ error: "Invalid parameters" });
  }

  const column = `${timeframe}_points`;
  
  try {
    const data = db.prepare(`
      SELECT 
        l.user_id as _id, 
        l.user_id as userId,
        u.username, 
        u.avatar,
        l.region,
        l.level,
        l.badges,
        l.${column} as points,
        l.daily_points as dailyPoints,
        l.weekly_points as weeklyPoints,
        l.monthly_points as monthlyPoints,
        l.global_points as seasonPoints
      FROM leaderboards l
      JOIN users u ON l.user_id = u.id
      WHERE l.type = ?
      ORDER BY l.${column} DESC
      LIMIT 100
    `).all(type);

    // Parse badges JSON
    const formattedData = data.map((item: any) => ({
      ...item,
      badges: JSON.parse(item.badges || "[]")
    }));

    res.json(formattedData);
  } catch (err: any) {
    console.error("Leaderboard Fetch Error Details:", {
      message: err.message,
      stack: err.stack,
      timeframe,
      type,
      column
    });
    res.status(500).json({ 
      error: "Failed to fetch leaderboard",
      details: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

export default router;
