import db from "../config/db";

export async function addPoints(userId: string, type: 'streamer' | 'gifter' | 'agency', points: number) {
  try {
    const existing = db.prepare("SELECT * FROM leaderboards WHERE user_id = ? AND type = ?").get(userId, type) as any;

    if (!existing) {
      db.prepare(`
        INSERT INTO leaderboards (user_id, type, daily_points, weekly_points, monthly_points, global_points, level)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(userId, type, points, points, points, points, Math.floor(points / 10000) + 1);
    } else {
      const newGlobalPoints = existing.global_points + points;
      const newLevel = Math.floor(newGlobalPoints / 10000) + 1;

      db.prepare(`
        UPDATE leaderboards 
        SET daily_points = daily_points + ?,
            weekly_points = weekly_points + ?,
            monthly_points = monthly_points + ?,
            global_points = global_points + ?,
            level = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND type = ?
      `).run(points, points, points, points, newLevel, userId, type);
    }
  } catch (err) {
    console.error("Error adding leaderboard points:", err);
  }
}
