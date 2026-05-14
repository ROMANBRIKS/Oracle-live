import db from "../config/db";

export const trackView = (req: any, res: any) => {
  const { userId, streamId, category } = req.body;
  try {
    db.prepare("INSERT INTO activity (user_id, stream_id, category) VALUES (?, ?, ?)").run(userId, streamId, category);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: "Tracking failed" });
  }
};

export const getRecommendations = (req: any, res: any) => {
  const { userId } = req.params;
  try {
    const favorite = db.prepare(`
      SELECT category, COUNT(*) as count 
      FROM activity 
      WHERE user_id = ? 
      GROUP BY category 
      ORDER BY count DESC 
      LIMIT 1
    `).get(userId) as any;

    const allStreams = [
      { id: "1", title: "Music Vibes", category: "music", user: "DJ_Flow" },
      { id: "2", title: "Pro Gaming", category: "gaming", user: "GamerX" },
      { id: "3", title: "Dance Party", category: "dance", user: "StepUp" },
      { id: "4", title: "Piano Solo", category: "music", user: "Mozart2" },
    ];

    if (!favorite) {
      return res.json(allStreams.slice(0, 2));
    }

    const recommended = allStreams.filter(s => s.category === favorite.category);
    res.json(recommended);
  } catch (error) {
    res.status(500).json({ error: "Recommendation failed" });
  }
};

export const getLeaderboard = (req: any, res: any) => {
  try {
    const { period } = req.query; // 'weekly' or 'all'
    
    let topGifters;
    if (period === 'weekly') {
        topGifters = db.prepare(`
            SELECT u.username, SUM(t.amount) as total_spent
            FROM users u
            JOIN transactions t ON u.id = t.user_id
            WHERE t.type = 'gift_sent' 
            AND t.created_at >= date('now', '-7 days')
            GROUP BY u.id
            ORDER BY total_spent DESC
            LIMIT 10
        `).all();
    } else {
        topGifters = db.prepare("SELECT username, total_spent FROM users WHERE total_spent > 0 ORDER BY total_spent DESC LIMIT 10").all();
    }

    const topCoins = db.prepare("SELECT username, coins FROM users ORDER BY coins DESC LIMIT 10").all();
    res.json({ coins: topCoins, gifters: topGifters });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch leaderboard" });
  }
};

export const getFeed = (req: any, res: any) => {
  try {
    const userId = req.user?.userId;
    const user = userId ? db.prepare("SELECT location_iso FROM users WHERE id = ?").get(userId) as any : null;

    // Fetch rooms from recommendation_scores joined with users
    const feedData = db.prepare(`
      SELECT 
        rs.room_id as id, 
        rs.final_score, 
        rs.live_viewers as viewers, 
        u.username as user, 
        u.location_iso,
        u.whale_score
      FROM recommendation_scores rs
      JOIN users u ON rs.streamer_id = u.id
      ORDER BY rs.final_score DESC
      LIMIT 50
    `).all() as any[];

    if (feedData.length === 0) {
       // Fallback mock data if no real data yet
       return res.json([
         { id: "sample-room", title: "Oracle Stage", category: "live", user: "OracleDev", viewers: 1200, whale_score: 150, location_iso: "US" }
       ]);
    }

    const sortedFeed = feedData.sort((a, b) => {
      // Prioritize Whale Score
      if ((b.whale_score || 0) !== (a.whale_score || 0)) return (b.whale_score || 0) - (a.whale_score || 0);
      // Prioritize Same Region
      if (user && a.location_iso === user.location_iso && b.location_iso !== user.location_iso) return -1;
      if (user && b.location_iso === user.location_iso && a.location_iso !== user.location_iso) return 1;
      // Prioritize Viewers
      return (b.viewers || 0) - (a.viewers || 0);
    });

    res.json(sortedFeed);
  } catch (error: any) {
    console.error("Feed error:", error);
    res.status(500).json({ error: "Failed to fetch feed", details: error.message });
  }
};
