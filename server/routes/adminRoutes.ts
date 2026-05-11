import express from "express";
import db from "../config/db";
import os from "os";
import auth from "../middleware/auth";
import admin from "../middleware/admin";

const router = express.Router();

// Apply protection to all admin routes
router.use(auth);
router.use(admin);

// Ban user
router.post("/ban", (req, res) => {
  const { targetUserId, adminId, reason } = req.body;
  try {
    db.prepare("INSERT INTO bans (user_id, admin_id, reason) VALUES (?, ?, ?)").run(targetUserId, adminId, reason);
    res.json({ success: true, message: "User banned successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Mute user
router.post("/mute", (req, res) => {
  const { targetUserId } = req.body;
  try {
    db.prepare("INSERT INTO mutes (user_id) VALUES (?)").run(targetUserId);
    res.json({ success: true, message: "User muted successfully" });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Report stream/user
router.post("/report", (req, res) => {
  const { reporterId, targetUserId, reason } = req.body;
  try {
    db.prepare("INSERT INTO reports (reporter_id, target_user_id, reason) VALUES (?, ?, ?)").run(reporterId, targetUserId, reason);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get all reports
router.get("/reports", (req, res) => {
  try {
    const reports = db.prepare(`
        SELECT r.*, u1.username as reporter_name, u2.username as target_name 
        FROM reports r
        JOIN users u1 ON r.reporter_id = u1.id
        JOIN users u2 ON r.target_user_id = u2.id
        ORDER BY r.created_at DESC
    `).all();
    res.json(reports);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Platform Stats
router.get("/stats", (req, res) => {
    try {
        const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
        const totalReports = db.prepare("SELECT COUNT(*) as count FROM reports").get() as any;
        const totalBans = db.prepare("SELECT COUNT(*) as count FROM bans").get() as any;
        const totalCoins = db.prepare("SELECT SUM(coins) as sum FROM users").get() as any;
        
        res.json({
            users: totalUsers.count,
            reports: totalReports.count,
            bans: totalBans.count,
            platform_wealth: totalCoins.sum || 0,
            uptime: process.uptime(),
            load: os.loadavg()
        });
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
});

// Check if user is banned (Internal middleware-like helper could use this)
router.get("/check-ban/:userId", (req, res) => {
  const { userId } = req.params;
  const ban = db.prepare("SELECT * FROM bans WHERE user_id = ?").get(userId);
  res.json({ banned: !!ban, details: ban });
});

// Mission Control - The "Everything" Dashboard
router.get("/mission-control", (req, res) => {
  try {
    const totalWhales = db.prepare("SELECT COUNT(*) as count FROM users WHERE whale_score > 100").get() as any;
    const whalesByRegion = db.prepare("SELECT location_iso, COUNT(*) as count FROM users WHERE whale_score > 100 GROUP BY location_iso").all();
    const highValueDevices = db.prepare("SELECT device_info, COUNT(*) as count FROM users WHERE device_info LIKE '%iPhone 15%' OR device_info LIKE '%iPhone 16%' GROUP BY device_info").all();
    
    const recentWhaleActivity = db.prepare(`
      SELECT u.username, u.whale_score, u.location_iso, u.device_info, t.amount, t.created_at
      FROM transactions t
      JOIN users u ON t.user_id = u.id
      WHERE u.whale_score > 50
      ORDER BY t.created_at DESC
      LIMIT 10
    `).all();

    const viralLeads = db.prepare("SELECT username, viral_points FROM users ORDER BY viral_points DESC LIMIT 5").all();

    const totalCoins = db.prepare("SELECT SUM(coins) as sum FROM users").get() as any;

    const pendingWithdrawals = db.prepare(`
      SELECT w.*, u.username
      FROM withdrawals w
      JOIN users u ON w.user_id = u.id
      WHERE w.status IN ('pending', 'queued')
      ORDER BY w.created_at DESC
    `).all();

    res.json({
      summary: {
        total_whales: totalWhales.count,
        top_growth_region: whalesByRegion[0]?.location_iso || "N/A",
        platform_wealth: (totalCoins.sum || 0) / 1000,
        pending_withdrawals: pendingWithdrawals.length
      },
      geography: whalesByRegion,
      devices: highValueDevices,
      recent_activity: recentWhaleActivity,
      viral_performance: viralLeads,
      withdrawals: pendingWithdrawals
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
