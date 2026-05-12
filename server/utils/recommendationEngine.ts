import db from "../config/db";

export async function calculateScore(roomId: string) {
  try {
    const room = db.prepare("SELECT * FROM recommendation_scores WHERE room_id = ?").get(roomId) as any;
    if (!room) return null;

    // Weights
    const viewerWeight = (room.live_viewers || 0) * 0.25;
    const watchWeight = (room.watch_time || 0) * 0.2;
    const engagementWeight = (room.engagement_rate || 0) * 0.2;
    const giftWeight = (room.gift_score || 0) * 0.2;
    const followWeight = (room.follow_score || 0) * 0.1;
    const penalty = (room.report_score || 0) * 0.3;

    let finalScore = viewerWeight + watchWeight + engagementWeight + giftWeight + followWeight - penalty;
    let trendingScore = room.trending_score || 0;

    // TRENDING BOOST
    if ((room.live_viewers || 0) > 100 && (room.engagement_rate || 0) > 70) {
      trendingScore += 50;
      finalScore += 50;
    }

    db.prepare(`
      UPDATE recommendation_scores 
      SET final_score = ?, trending_score = ?, updated_at = CURRENT_TIMESTAMP
      WHERE room_id = ?
    `).run(finalScore, trendingScore, roomId);

    return db.prepare("SELECT * FROM recommendation_scores WHERE room_id = ?").get(roomId);
  } catch (err) {
    console.error("AI Recommendation Score calculation failed:", err);
    return null;
  }
}

export async function getRecommendedStreams(limit = 50) {
  try {
    // Only return rooms that are likely "active" or have recent activity
    // In a real app we'd join with a 'rooms' table to check status
    return db.prepare(`
      SELECT rs.*, u.username as streamer_name, u.avatar as streamer_avatar
      FROM recommendation_scores rs
      LEFT JOIN users u ON rs.streamer_id = u.id
      ORDER BY rs.final_score DESC
      LIMIT ?
    `).all(limit);
  } catch (err) {
    console.error("Failed to fetch recommended streams:", err);
    return [];
  }
}

export async function incrementEngagement(roomId: string, streamerId?: string) {
  try {
    db.prepare(`
      INSERT INTO recommendation_scores (room_id, streamer_id, engagement_rate)
      VALUES (?, ?, 1)
      ON CONFLICT(room_id) DO UPDATE SET 
        engagement_rate = engagement_rate + 1,
        streamer_id = COALESCE(EXCLUDED.streamer_id, recommendation_scores.streamer_id),
        updated_at = CURRENT_TIMESTAMP
    `).run(roomId, streamerId || null);
    
    // Recalculate score periodically or on significant change
    await calculateScore(roomId);
  } catch (err) {
    console.error("Engagement increment failed:", err);
  }
}

export async function incrementGiftScore(roomId: string, streamerId: string, amount: number) {
    try {
      db.prepare(`
        INSERT INTO recommendation_scores (room_id, streamer_id, gift_score)
        VALUES (?, ?, ?)
        ON CONFLICT(room_id) DO UPDATE SET 
          gift_score = gift_score + ?,
          updated_at = CURRENT_TIMESTAMP
      `).run(roomId, streamerId, amount, amount);
      
      await calculateScore(roomId);
    } catch (err) {
      console.error("Gift score increment failed:", err);
    }
  }
