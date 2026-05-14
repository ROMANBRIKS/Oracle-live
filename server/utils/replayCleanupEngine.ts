import db from "../config/db";

export async function cleanupOldReplays() {
  try {
    console.log("Running replay cleanup engine...");
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    // In a real scenario, we would also delete the files from S3 here
    // For now, we clean up the database records.
    const result = db.prepare(`
      DELETE FROM stream_recordings
      WHERE created_at < ?
    `).run(thirtyDaysAgo);

    console.log(`Cleaned up ${result.changes} old replays.`);
  } catch (err) {
    console.error("Replay cleanup failed:", err);
  }
}

export default { cleanupOldReplays };
