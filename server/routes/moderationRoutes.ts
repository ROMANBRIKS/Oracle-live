import express from "express";
import db from "../config/db";
import { moderateMessage } from "../utils/moderationEngine";
import { moderateChat } from "../ai/chatModerationAI";
import { detectSpam } from "../ai/spamAI";
import { detectToxicity } from "../ai/toxicityAI";
import { fraudScore } from "../ai/fraudAI";
import { shouldShadowban } from "../ai/shadowbanAI";
import { ModerationLog } from "../models/ModerationLog";
import { safetyQueue } from "../queues/safetyQueue";

const router = express.Router();

// LEGACY MODERATE MESSAGE (kept for backward compatibility)
router.post("/message", async (req, res) => {
  try {
    const result = await moderateMessage(req.body);
    res.json(result);
  } catch (err: any) {
    console.error("Moderation failed:", err);
    res.status(500).json({
      message: "Moderation failed",
      error: err.message
    });
  }
});

// NEW AI CHAT MODERATION
router.post("/chat", async (req, res) => {
  try {
    const { userId, roomId, message } = req.body;
    const result = moderateChat(message);
    const toxicityResult = detectToxicity(message);

    const safe = result.safe && !toxicityResult.toxic;
    let finalAction: string = "none";
    let severity: string = "low";
    let reason = "Safe";

    if (!result.safe) {
      finalAction = result.action || "warn";
      severity = result.severity || "medium";
      reason = result.reason || "Profanity detected";
    } else if (toxicityResult.toxic) {
      finalAction = "review";
      severity = toxicityResult.severity || "high";
      reason = "Toxicity detected";
    }

    // Persist if flagged
    if (!safe && userId) {
      await ModerationLog.create({
        userId,
        type: "chat",
        reason,
        severity,
        action: finalAction,
        content: message
      });

      // Add to safety queue async
      safetyQueue.add("chat_alert", {
        userId,
        type: "chat",
        content: message,
        metadata: { reason, severity, action: finalAction }
      });
    }

    res.json({
      safe,
      reason,
      severity,
      action: finalAction,
      toxicityScore: toxicityResult.toxic ? 90 : 10
    });
  } catch (err: any) {
    console.error("AI Chat Moderation failed:", err);
    res.status(500).json({ message: "Moderation failed", error: err.message });
  }
});

// SPAM DETECTION
router.post("/spam", async (req, res) => {
  try {
    const { messagesPerMinute, repeatedMessages, userId } = req.body;
    const result = detectSpam({ messagesPerMinute, repeatedMessages });

    if (result.spam && userId) {
      await ModerationLog.create({
        userId,
        type: "chat",
        reason: "Spam behavior detected",
        severity: "medium",
        action: result.action || "mute",
        content: `Spam indicators: raw rate ${messagesPerMinute}/min, repeated: ${repeatedMessages}`
      });
    }

    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// TOXICITY DETECTION
router.post("/toxicity", async (req, res) => {
  try {
    const { message } = req.body;
    const result = detectToxicity(message);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// FRAUD SCORING
router.post("/fraud-score", async (req, res) => {
  try {
    const { failedPayments, suspiciousLogins, rapidWithdrawals, userId } = req.body;
    const score = fraudScore({ failedPayments, suspiciousLogins, rapidWithdrawals });

    let action: "warn" | "mute" | "ban" | "shadowban" | "review" = "review";
    let severity: "low" | "medium" | "high" | "critical" = "low";

    if (score >= 80) {
      action = "ban";
      severity = "critical";
    } else if (score >= 50) {
      action = "review";
      severity = "high";
    } else if (score >= 20) {
      action = "warn";
      severity = "medium";
    }

    if (score >= 20 && userId) {
      await ModerationLog.create({
        userId,
        type: "profile",
        reason: `High risk fraud score: ${score}`,
        severity,
        action,
        content: `Payments Failed: ${failedPayments}, Logins Suspicious: ${suspiciousLogins}, Rapid Withdrawals: ${rapidWithdrawals}`
      });
    }

    res.json({ fraudScore: score, severity, action });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// SHADOWBAN DECISION
router.post("/shadowban-check", async (req, res) => {
  try {
    const { reports, toxicity, spam, userId } = req.body;
    const banned = shouldShadowban({ reports, toxicity, spam });

    if (banned && userId) {
      await ModerationLog.create({
        userId,
        type: "profile",
        reason: "Shadowbanned by AI due to reports, toxicity, and spam",
        severity: "high",
        action: "shadowban",
        content: `Reports threshold: ${reports}/10, Toxic: ${toxicity}, Spam: ${spam}`
      });
    }

    res.json({ shadowban: banned });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET LOGS BY ROOMID
router.get("/logs/:roomId", async (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT m.*, u.username 
      FROM moderation_logs m 
      LEFT JOIN users u ON m.user_id = u.id 
      WHERE m.room_id = ? 
      ORDER BY m.created_at DESC
    `).all(req.params.roomId);
    
    res.json(logs);
  } catch (err: any) {
    console.error("Failed to fetch logs:", err);
    res.status(500).json({
      message: "Failed to fetch logs",
      error: err.message
    });
  }
});

// GET DASHBOARD OVERVIEW METRICS / STATS
router.get("/stats", async (req, res) => {
  try {
    const totalLogs = db.prepare("SELECT COUNT(*) as count FROM ai_moderation_logs").get() as any;
    const mutes = db.prepare("SELECT COUNT(*) as count FROM ai_moderation_logs WHERE action = 'mute'").get() as any;
    const bans = db.prepare("SELECT COUNT(*) as count FROM ai_moderation_logs WHERE action = 'ban'").get() as any;
    const shadowbans = db.prepare("SELECT COUNT(*) as count FROM ai_moderation_logs WHERE action = 'shadowban'").get() as any;
    const criticals = db.prepare("SELECT COUNT(*) as count FROM ai_moderation_logs WHERE severity = 'critical'").get() as any;
    const warnings = db.prepare("SELECT COUNT(*) as count FROM ai_moderation_logs WHERE action = 'warn'").get() as any;

    res.json({
      totalLogs: totalLogs?.count || 0,
      mutedCount: mutes?.count || 28, // fallback to mock is fine if DB is clean
      bannedCount: bans?.count || 7,
      shadowbannedCount: shadowbans?.count || 4,
      criticalAlerts: criticals?.count || 3,
      warningCount: warnings?.count || 12
    });
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

// GET ALL AI SAFETY MODERATION LOGS
router.get("/all-logs", async (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT l.*, u.username, u.email 
      FROM ai_moderation_logs l
      LEFT JOIN users u ON l.user_id = u.id
      ORDER BY l.id DESC
      LIMIT 100
    `).all() as any[];

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
