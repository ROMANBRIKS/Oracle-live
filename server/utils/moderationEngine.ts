import db from "../config/db";

const bannedWords = [
  "badword1",
  "badword2",
  "scam",
  "fraud",
  "spam",
];

export async function moderateMessage({
  userId,
  roomId,
  message,
}: {
  userId: string;
  roomId: string;
  message: string;
}) {
  const lower = message.toLowerCase();

  const found = bannedWords.find((word) => lower.includes(word));

  if (found) {
    const stmt = db.prepare(`
      INSERT INTO moderation_logs (user_id, room_id, type, reason, message, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, roomId, "warning", "Bad language: " + found, message, "medium");

    return {
      flagged: true,
      action: "warning",
    };
  }

  // SPAM DETECTION: More than 8 repeated characters
  const repeated = /(.)\1{8,}/.test(message);

  if (repeated) {
    const stmt = db.prepare(`
      INSERT INTO moderation_logs (user_id, room_id, type, reason, message, severity)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    stmt.run(userId, roomId, "mute", "Spam detected (repeated characters)", message, "high");

    return {
      flagged: true,
      action: "mute",
    };
  }

  return {
    flagged: false,
  };
}
