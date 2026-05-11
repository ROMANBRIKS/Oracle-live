import db from "../config/db";
import { Server } from "socket.io";

export function notify(userId: string, title: string, message: string, type: string = "system", io?: Server) {
  try {
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `);
    stmt.run(userId, title, message, type);

    if (io) {
      io.to(userId).emit("notification", {
        title,
        message,
        type,
        created_at: new Date()
      });
    }
  } catch (err) {
    console.error("Notify failed", err);
  }
}
