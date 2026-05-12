import express from "express";
import db from "../config/db";
import auth from "../middleware/auth";
import adminAuth from "../middleware/adminAuth";
import { logAdminAction } from "../utils/adminAuditEngine";

const router = express.Router();

router.use(auth); // Requires being logged in

/**
 * Create or upgrade a user to an admin role
 */
router.post("/create", adminAuth("manage_admins"), async (req: any, res) => {
  try {
    const { userId, role, permissions } = req.body;

    if (!userId || !role) {
      return res.status(400).json({ message: "UserId and role are required" });
    }

    // Check if user exists in the main users table
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(userId) as any;
    if (!user) return res.status(404).json({ message: "User not found" });

    // Insert or Update the staff_admin record
    db.prepare(`
      INSERT INTO staff_admins (id, username, email, role, permissions, active)
      VALUES (?, ?, ?, ?, ?, 1)
      ON CONFLICT(id) DO UPDATE SET 
        role = EXCLUDED.role,
        permissions = EXCLUDED.permissions,
        active = 1
    `).run(userId, user.username, user.email, role, JSON.stringify(permissions || []));

    // Log the action
    await logAdminAction({
      adminId: req.user.userId,
      action: "create_admin",
      targetId: userId,
      targetType: "admin_role",
      metadata: { role, permissions },
      ipAddress: req.ip
    });

    res.json({ success: true, message: "Admin role assigned/updated" });
  } catch (err: any) {
    console.error("Failed to create admin:", err);
    res.status(500).json({ message: "Failed to create admin", error: err.message });
  }
});

/**
 * Get all admin audit logs
 */
router.get("/audit-logs", adminAuth("view_audit_logs"), async (req, res) => {
  try {
    const logs = db.prepare(`
      SELECT l.*, u.username as admin_name
      FROM admin_audit_logs l
      LEFT JOIN users u ON l.admin_id = u.id
      ORDER BY l.created_at DESC
      LIMIT 100
    `).all();

    res.json(logs);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch audit logs", error: err.message });
  }
});

/**
 * Get list of all admins
 */
router.get("/list", adminAuth("manage_admins"), (req, res) => {
  try {
    const admins = db.prepare("SELECT * FROM staff_admins").all();
    res.json(admins);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch admins" });
  }
});

export default router;
