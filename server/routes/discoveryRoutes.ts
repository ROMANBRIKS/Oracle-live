import express from "express";
import db from "../config/db";
import { calculateEngagement } from "../ai/engagementAI";
import { predictVirality } from "../ai/viralPrediction";
import { calculateRetention } from "../ai/retentionAI";
import { predictCreatorGrowth } from "../ai/creatorGrowthAI";
import { shouldNotify } from "../ai/notificationAI";
import StreamAnalytics, { StreamAnalyticsInstance } from "../models/StreamAnalytics";

const router = express.Router();

// Helper to ensure default stream analytics exist and are populated with AI scores
function ensureAndPopulateAnalytics(stream: any): any {
  let record = db.prepare("SELECT * FROM stream_analytics WHERE room_id = ?").get(stream.id) as any;
  
  // Calculate on-the-fly random metrics mapped to the actual live state
  const likes = record ? record.likes : Math.floor(Math.random() * 500) + 12;
  const shares = record ? record.shares : Math.floor(Math.random() * 80) + 2;
  const gifts = record ? record.total_gifts : Math.floor(Math.random() * 25);
  const totalCoins = record ? record.total_coins : gifts * 10;
  const totalViewers = record ? record.total_viewers : (stream.viewer_count || Math.floor(Math.random() * 120) + 5);
  const peakViewers = record ? record.peak_viewers : Math.max(totalViewers, Math.floor(totalViewers * 1.3));
  const watchTime = record ? record.watch_time : totalViewers * (Math.floor(Math.random() * 10) + 2);
  const newFollowers = record ? record.new_followers : Math.floor(totalViewers * 0.15);

  const comments = Math.floor(likes * 0.4);
  const joinedUsers = Math.max(totalViewers, 30);
  const stayedUsers = Math.floor(joinedUsers * (0.4 + Math.random() * 0.5));

  // Utilize the import engines!
  const engagement = calculateEngagement({
    likes,
    comments,
    shares,
    gifts,
    watchTime,
  });

  const retention = calculateRetention({
    joinedUsers,
    stayedUsers,
  });

  const aiViralScore = predictVirality({
    engagement,
    retention,
    shares,
  });

  const averageWatchTime = totalViewers > 0 ? parseFloat((watchTime / totalViewers).toFixed(2)) : 0;
  const giftScore = gifts * 1.5;

  if (record) {
    // Update existing record with the calculated AI metrics if they are 0
    if (record.ai_viral_score === 0 || !record.ai_viral_score) {
      db.prepare(`
        UPDATE stream_analytics 
        SET engagement_score = ?, retention_rate = ?, ai_viral_score = ?, average_watch_time = ?, gift_score = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(engagement, retention, aiViralScore, averageWatchTime, giftScore, record.id);
    }
  } else {
    // Insert new analytics record
    const id = "sa_" + Math.random().toString(36).substring(2, 11);
    db.prepare(`
      INSERT INTO stream_analytics (
        id, streamer_id, room_id, total_viewers, peak_viewers, total_gifts, total_coins, 
        watch_time, new_followers, likes, shares, stream_duration, average_watch_time, 
        engagement_score, gift_score, retention_rate, ai_viral_score
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 120, ?, ?, ?, ?, ?)
    `).run(
      id,
      stream.host_id,
      stream.id,
      totalViewers,
      peakViewers,
      gifts,
      totalCoins,
      watchTime,
      newFollowers,
      likes,
      shares,
      averageWatchTime,
      engagement,
      giftScore,
      retention,
      aiViralScore
    );
  }

  // Get freshest value
  record = db.prepare("SELECT * FROM stream_analytics WHERE room_id = ?").get(stream.id) as any;
  return record;
}

// GET TRENDING STREAMS - Returns streams joined with their calculated AI metrics
router.get("/trending", async (req, res) => {
  try {
    // 1. Fetch available streams in the database
    const streams = db.prepare(`
      SELECT s.*, u.username, u.email, u.avatar
      FROM streams s
      JOIN users u ON s.host_id = u.id
    `).all() as any[];

    // Ensure all streams have stream_analytics populated
    streams.forEach(stream => {
      ensureAndPopulateAnalytics(stream);
    });

    // 2. Query joins with latest metrics
    const results = db.prepare(`
      SELECT 
        s.id AS stream_id,
        s.title AS stream_title,
        s.is_live,
        s.viewer_count,
        u.id AS streamer_id,
        u.username AS streamer_name,
        u.avatar,
        sa.id AS analytics_id,
        sa.engagement_score,
        sa.retention_rate,
        sa.ai_viral_score,
        sa.average_watch_time,
        sa.total_gifts,
        sa.likes,
        sa.shares
      FROM streams s
      JOIN users u ON s.host_id = u.id
      JOIN stream_analytics sa ON s.id = sa.room_id
      ORDER BY sa.ai_viral_score DESC
      LIMIT 20
    `).all() as any[];

    res.json(results);
  } catch (err: any) {
    console.error("[DISCOVERY_TRENDING] Error fetching trending streams:", err);
    res.status(500).json({
      message: "Failed to fetch trending streams",
      error: err.message
    });
  }
});

// CALCULATE AI SCORES FOR A ROOM SPECIFICALLY
router.post("/recalculate/:roomId", async (req, res) => {
  try {
    const { roomId } = req.params;
    const stream = db.prepare("SELECT * FROM streams WHERE id = ?").get(roomId) as any;
    if (!stream) {
      return res.status(404).json({ success: false, message: "Stream not found" });
    }

    const analytics = ensureAndPopulateAnalytics(stream);
    res.json({
      success: true,
      message: "Analytics recalculated successfully",
      analytics
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// FORECAST CREATOR GROWTH
router.get("/creator-growth/:streamerId", async (req, res) => {
  try {
    const { streamerId } = req.params;
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(streamerId) as any;
    if (!user) {
      return res.status(404).json({ success: false, message: "Streamer/User not found" });
    }

    // Accumulate all past analytics records for this streamer
    const records = db.prepare("SELECT * FROM stream_analytics WHERE streamer_id = ?").all(streamerId) as any[];
    
    let totalLikes = 0;
    let totalShares = 0;
    let totalGifts = 0;
    let totalEngagement = 0;
    
    records.forEach(r => {
      totalLikes += r.likes || 0;
      totalShares += r.shares || 0;
      totalGifts += r.total_gifts || 0;
      totalEngagement += r.engagement_score || 0;
    });

    // Mock initial count
    const followers = user.followers || Math.floor(Math.random() * 1200) + 150;
    const averageEngagement = records.length > 0 ? (totalEngagement / records.length) : (Math.random() * 45 + 10);
    // Consistency could be number of recorded streams in database
    const consistency = Math.min(100, Math.max(20, records.length * 10));

    const growthFactor = predictCreatorGrowth({
      followers,
      engagement: averageEngagement,
      consistency
    });

    res.json({
      success: true,
      streamerId,
      username: user.username,
      metrics: {
        followers,
        averageEngagement,
        consistency,
        growthFactor,
        projectedFollowersNextMonth: Math.floor(followers * (1 + (growthFactor / 100)))
      }
    });

  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// DECIDE IF A NOTIFICATION SHOULD BE SENT FOR VIRAL SPIKE
router.post("/evaluate-notification", async (req, res) => {
  try {
    const { roomId, viewerInterest } = req.body;
    const record = db.prepare("SELECT * FROM stream_analytics WHERE room_id = ?").get(roomId) as any;
    if (!record) {
      return res.status(404).json({ success: false, message: "Stream analytics not found" });
    }

    const aiViralScore = record.ai_viral_score || 0;
    const interest = viewerInterest !== undefined ? Number(viewerInterest) : (Math.floor(Math.random() * 50) + 30);
    
    const sendPush = shouldNotify({
      aiViralScore,
      viewerInterest: interest
    });

    res.json({
      success: true,
      roomId,
      aiViralScore,
      viewerInterest: interest,
      shouldNotifyUser: sendPush,
      notificationPayload: sendPush ? {
        title: "🔥 LIVE VIRAL EXPLOSION!",
        body: `Stream is going viral with score ${aiViralScore}! Join the stream right now.`,
        actionUrl: `/live/${roomId}`
      } : null
    });

  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
