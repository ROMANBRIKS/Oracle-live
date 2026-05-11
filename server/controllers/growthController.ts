import db from "../config/db";

// 🧠 WHALE IDENTIFICATION LOGIC
// We analyze:
// 1. Location (GCC, US, UK get higher scores)
// 2. Device (Newest iPhones/High-end Android)
// 3. Behavior (Frequency of recharge, size of gifts)

export const identifyWhale = (userId: string) => {
  try {
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    if (!user) return;

    let score = 0;

    // 📍 Location Factor
    const highArpuRegions = ['SA', 'AE', 'QA', 'KW', 'US', 'GB', 'DE', 'CA'];
    if (highArpuRegions.includes(user.location_iso)) {
      score += 50;
    }

    // 📱 Device Factor
    if (user.device_info?.toLowerCase().includes('iphone')) {
      score += 30;
      if (user.device_info?.includes('15') || user.device_info?.includes('16')) {
        score += 20;
      }
    }

    // 💰 Spending Factor
    const transactions = db.prepare("SELECT SUM(amount) as total FROM transactions WHERE user_id = ? AND type LIKE '%purchase%'").get(userId) as any;
    if (transactions?.total > 100000) { // Over $1000 spent
      score += 200;
    } else if (transactions?.total > 10000) {
      score += 100;
    }

    db.prepare("UPDATE users SET whale_score = ? WHERE id = ?").run(score, userId);
    return score;
  } catch (error) {
    console.error("Whale identification error:", error);
  }
};

// 🚀 VIRAL SEO ENGINE
// Generates metadata for social crawlers based on currently hot whales and events
export const getSEOData = (req: any, res: any) => {
  try {
    const trendingStreams = db.prepare(`
      SELECT s.*, u.username, u.whale_score, u.location_iso 
      FROM streams s
      JOIN users u ON s.host_id = u.id
      ORDER BY u.whale_score DESC, s.viewer_count DESC
      LIMIT 10
    `).all() as any[];

    // Target the "Whale Corridors" specifically in metadata
    const highValueKeywords = [
      "Saudi Arabia Live Streaming", 
      "Dubai Elite Social", 
      "London High Stakes PK", 
      "Luxury Digital Gifting",
      "VIP Social Network US"
    ];

    res.json({
      title: "Oracle Live | Elite Global Streaming",
      description: "Join high-stakes PK battles and luxury gifting events. The preferred network for the global elite.",
      keywords: highValueKeywords.join(", "),
      og_type: "video.movie",
      structured_data: {
        "@context": "https://schema.org",
        "@type": "LiveBlogPosting",
        "description": "High-value social streaming network for premium creators and whales.",
        "coverageStartTime": new Date().toISOString(),
      },
      streams: trendingStreams.map(s => ({
        label: `${s.username} Live in ${s.location_iso || 'Global'}`,
        whale_intent: s.whale_score > 100
      }))
    });
  } catch (error) {
    res.status(500).json({ error: "SEO Engine Error" });
  }
};

// 📈 GROWTH TRACKING
// Users get "Viral Points" for bringing in High-Score whales from shared links
export const trackViralGrowth = (req: any, res: any) => {
  const { referrerId, joinerId, location, device } = req.body;
  try {
    // Score the joiner first
    let baseScore = 10;
    const highArpuRegions = ['SA', 'AE', 'QA', 'KW', 'US', 'GB', 'DE', 'CA'];
    if (highArpuRegions.includes(location)) baseScore += 40;

    db.prepare("UPDATE users SET viral_points = viral_points + ? WHERE id = ?").run(baseScore, referrerId);
    
    res.json({ success: true, points_awarded: baseScore });
  } catch (error) {
    res.status(500).json({ error: "Viral tracking failed" });
  }
};
