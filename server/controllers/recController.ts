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
    const userId = req.user?.userId; // Assuming auth middleware adds user to req
    const user = userId ? db.prepare("SELECT location_iso FROM users WHERE id = ?").get(userId) as any : null;

    // 🧠 SMART WHALE ALGORITHM
    // 1. Show Whale streamers first (High Whale Score)
    // 2. Show streamers from same region
    // 3. Show high activity streams (viewers)
    // For now we still use mock data but with the algorithm structure
    const feedData = [
      { id: "1", title: "Midnight Beats", category: "music", user: "NeonDemon", viewers: 1200, whale_score: 150, location_iso: "SA" },
      { id: "2", title: "Code with Me", category: "tech", user: "OracleDev", viewers: 850, whale_score: 200, location_iso: "US" },
      { id: "3", title: "Global Dance Off", category: "dance", user: "StepMaster", viewers: 3400, whale_score: 50, location_iso: "TH" },
      { id: "4", title: "Cyber Strategy", category: "gaming", user: "ZeroDay", viewers: 560, whale_score: 300, location_iso: "GB" },
      { id: "5", title: "Late Night Chat", category: "chat", user: "Luna_Star", viewers: 2100, whale_score: 80, location_iso: "AE" },
    ];

    const sortedFeed = feedData.sort((a, b) => {
      // Prioritize Whale Score
      if (b.whale_score !== a.whale_score) return b.whale_score - a.whale_score;
      // Prioritize Same Region
      if (user && a.location_iso === user.location_iso && b.location_iso !== user.location_iso) return -1;
      if (user && b.location_iso === user.location_iso && a.location_iso !== user.location_iso) return 1;
      // Prioritize Viewers
      return b.viewers - a.viewers;
    });

    res.json(sortedFeed);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};
