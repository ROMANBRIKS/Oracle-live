import db from "../config/db";

interface UpdateLeaderboardOptions {
  userId: string;
  type: 'streamer' | 'gifter' | 'agency';
  points: number;
  region?: string;
}

export async function updateLeaderboard({
  userId,
  type,
  points,
  region = "global",
}: UpdateLeaderboardOptions) {
  // Check if entry exists
  const existing = db.prepare("SELECT * FROM leaderboards WHERE user_id = ? AND type = ?").get(userId, type) as any;

  if (!existing) {
    db.prepare(`
      INSERT INTO leaderboards (user_id, type, region, daily_points, weekly_points, monthly_points, global_points, level, badges)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(userId, type, region, points, points, points, points, 1, JSON.stringify([]));
  } else {
    const newGlobalPoints = existing.global_points + points;
    const badges = JSON.parse(existing.badges || "[]");

    // Badge logic: Legend at 100k points
    if (newGlobalPoints > 100000 && !badges.includes("Legend")) {
      badges.push("Legend");
    }

    // Level logic: Basic example
    const newLevel = Math.floor(newGlobalPoints / 10000) + 1;

    db.prepare(`
      UPDATE leaderboards 
      SET daily_points = daily_points + ?,
          weekly_points = weekly_points + ?,
          monthly_points = monthly_points + ?,
          global_points = global_points + ?,
          level = ?,
          badges = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND type = ?
    `).run(points, points, points, points, newLevel, JSON.stringify(badges), userId, type);
  }

  return db.prepare("SELECT * FROM leaderboards WHERE user_id = ? AND type = ?").get(userId, type);
}

export const addPoints = (userId: string, type: 'streamer' | 'gifter' | 'agency', points: number) => {
  return updateLeaderboard({ userId, type, points });
};
