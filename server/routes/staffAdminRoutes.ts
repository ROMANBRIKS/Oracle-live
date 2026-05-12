import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import db from "../config/db";
import staffAuth from "../middleware/staffAuth";

const router = express.Router();

// STAFF LOGIN
router.post("/login", (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = db.prepare("SELECT * FROM staff_admins WHERE email = ? AND active = 1").get(email) as any;

    if (!admin) {
      return res.status(404).json({ message: "Staff admin not found or inactive" });
    }

    const valid = bcrypt.compareSync(password, admin.password);

    if (!valid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const permissions = {
      manageUsers: !!admin.manage_users,
      managePayments: !!admin.manage_payments,
      manageStreams: !!admin.manage_streams,
      manageModeration: !!admin.manage_moderation,
      manageTreasury: !!admin.manage_treasury,
    };

    const token = jwt.sign(
      {
        id: admin.id,
        role: admin.role,
        permissions,
      },
      process.env.JWT_SECRET || "oracle_secret_fallback",
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        permissions,
      },
    });
  } catch (err: any) {
    console.error("Staff Login Error:", err);
    res.status(500).json({ message: "Staff login failed", error: err.message });
  }
});

// CREATE STAFF ADMIN (Protected - Owner only)
router.post("/create", staffAuth, (req: any, res) => {
  try {
    if (req.admin.role !== 'owner' && req.admin.role !== 'super_admin') {
        return res.status(403).json({ message: "Only owners or super_admins can create new staff" });
    }

    const { username, email, password, role, permissions } = req.body;

    const hashedPassword = bcrypt.hashSync(password, 10);
    const id = uuidv4();

    db.prepare(`
        INSERT INTO staff_admins (id, username, email, password, role, manage_users, manage_payments, manage_streams, manage_moderation, manage_treasury)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
        id, 
        username, 
        email, 
        hashedPassword, 
        role || "support_admin",
        permissions?.manageUsers ? 1 : 0,
        permissions?.managePayments ? 1 : 0,
        permissions?.manageStreams ? 1 : 0,
        permissions?.manageModeration ? 1 : 0,
        permissions?.manageTreasury ? 1 : 0
    );

    res.json({
      success: true,
      id,
    });
  } catch (err: any) {
    console.error("Staff Creation Error:", err);
    res.status(500).json({ message: "Staff creation failed", error: err.message });
  }
});

// GET ACTIVITY LOGS
router.get("/logs", staffAuth, (req, res) => {
  try {
    const logs = db.prepare(`
        SELECT l.*, a.username as admin_name 
        FROM staff_admin_logs l
        JOIN staff_admins a ON l.admin_id = a.id
        ORDER BY l.created_at DESC
        LIMIT 100
    `).all();

    res.json(logs);
  } catch (err: any) {
    console.error("Fetch Logs Error:", err);
    res.status(500).json({ message: "Failed to fetch logs" });
  }
});

// INITIAL SETUP (Create first owner if none exist)
router.post("/initial-setup", (req, res) => {
    try {
        const count = db.prepare("SELECT COUNT(*) as count FROM staff_admins").get() as any;
        if (count.count > 0) {
            return res.status(400).json({ message: "Staff already initialized" });
        }

        const { username, email, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 10);
        const id = uuidv4();

        db.prepare(`
            INSERT INTO staff_admins (id, username, email, password, role, manage_users, manage_payments, manage_streams, manage_moderation, manage_treasury)
            VALUES (?, ?, ?, ?, 'owner', 1, 1, 1, 1, 1)
        `).run(id, username, email, hashedPassword);

        res.json({ success: true, message: "Initial owner created" });
    } catch (err: any) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
