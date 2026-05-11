import express from "express";
import db from "../config/db";

const router = express.Router();

// GET USER NOTIFICATIONS
router.get("/:userId", (req, res) => {
  try {
    const notifications = db.prepare("SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC").all(req.params.userId);
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Failed to load notifications" });
  }
});

// CREATE NOTIFICATION (internal utility usually, but exposing for parity with user request)
router.post("/create", (req, res) => {
  try {
    const { userId, title, message, type } = req.body;
    const stmt = db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `);
    const result = stmt.run(userId, title, message, type || "system");
    res.json({
      success: true,
      notificationId: result.lastInsertRowid
    });
  } catch (err) {
    res.status(500).json({ message: "Notification creation failed" });
  }
});

// MARK AS READ
router.post("/read/:id", (req, res) => {
  try {
    const stmt = db.prepare("UPDATE notifications SET read = 1 WHERE id = ?");
    stmt.run(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notification" });
  }
});

// MARK ALL AS READ
router.post("/read-all/:userId", (req, res) => {
  try {
    const stmt = db.prepare("UPDATE notifications SET read = 1 WHERE user_id = ?");
    stmt.run(req.params.userId);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to update notifications" });
  }
});

export default router;
