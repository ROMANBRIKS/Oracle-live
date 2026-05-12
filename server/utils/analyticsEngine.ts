import db from "../config/db";
import { v4 as uuidv4 } from "uuid";

interface AnalyticsUpdate {
  streamerId: string;
  roomId: string;
  field: string;
  value: number;
}

export async function updateAnalytics({
  streamerId,
  roomId,
  field,
  value,
}: AnalyticsUpdate) {
  try {
    // We use the room_id as the primary identifier for a stream session's analytics
    // In a real app we might have a session_id, but here room_id for the current session is fine.
    // However, if a room is reused, we might want to uniquely identify the stream.
    // For now, let's look for an active or most recent analytics record for this streamer and room.
    
    let analytics = db.prepare("SELECT * FROM stream_analytics WHERE streamer_id = ? AND room_id = ? ORDER BY created_at DESC LIMIT 1")
      .get(streamerId, roomId) as any;

    if (!analytics) {
      const id = uuidv4();
      db.prepare(`
        INSERT INTO stream_analytics (id, streamer_id, room_id, created_at, updated_at)
        VALUES (?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      `).run(id, streamerId, roomId);
      
      analytics = db.prepare("SELECT * FROM stream_analytics WHERE id = ?").get(id) as any;
    }

    // Mapping field names if they differ from the prompt's suggested fields
    // Prompt fields: liveViewers, peakViewers, totalViews, totalMessages, totalGifts, totalCoins, watchMinutes, followersGained, streamDuration
    // DB fields: total_viewers, peak_viewers, total_gifts, total_coins, watch_time, new_followers, likes, shares, stream_duration
    
    const fieldMap: Record<string, string> = {
      liveViewers: "total_viewers", // using total_viewers to track cumulative or current
      peakViewers: "peak_viewers",
      totalViews: "total_viewers",
      totalMessages: "likes", // using likes as a proxy or just adding a column if needed
      totalGifts: "total_gifts",
      totalCoins: "total_coins",
      watchMinutes: "watch_time",
      followersGained: "new_followers",
      streamDuration: "stream_duration"
    };

    const dbField = fieldMap[field] || field;

    // Direct update
    if (field === "peakViewers") {
        db.prepare(`UPDATE stream_analytics SET ${dbField} = MAX(${dbField}, ?), updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(value, analytics.id);
    } else {
        db.prepare(`UPDATE stream_analytics SET ${dbField} = ${dbField} + ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
          .run(value, analytics.id);
    }

    // Specially handle peak_viewers if we are updating total_viewers (assuming it's current)
    if (field === "liveViewers") {
        db.prepare(`UPDATE stream_analytics SET peak_viewers = MAX(peak_viewers, (SELECT total_viewers FROM stream_analytics WHERE id = ?)) WHERE id = ?`)
          .run(analytics.id, analytics.id);
    }

    return db.prepare("SELECT * FROM stream_analytics WHERE id = ?").get(analytics.id);
  } catch (err) {
    console.error("Failed to update analytics:", err);
    return null;
  }
}
