import express from "express";
import db from "../config/db";

import auth from "../middleware/auth";

const router = express.Router();

router.use(auth);

// Create agency
router.post("/create", (req, res) => {
  const { ownerId, agencyName } = req.body;

  try {
    const result = db.prepare("INSERT INTO agencies (name, owner_id) VALUES (?, ?)").run(agencyName, ownerId);
    const agencyId = result.lastInsertRowid;
    
    // Add owner as the first member
    db.prepare("INSERT INTO agency_members (agency_id, user_id) VALUES (?, ?)").run(agencyId, ownerId);
    
    res.json({ id: agencyId, name: agencyName, owner_id: ownerId });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: "Agency name already exists" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Join agency
router.post("/join", (req, res) => {
  const { userId, agencyId } = req.body;

  try {
    db.prepare("INSERT INTO agency_members (agency_id, user_id) VALUES (?, ?)").run(agencyId, userId);
    res.json({ success: true });
  } catch (error: any) {
    if (error.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
      return res.status(400).json({ error: "You are already a member of this agency" });
    }
    res.status(500).json({ error: error.message });
  }
});

// Get agencies with member counts
router.get("/", (req, res) => {
  try {
    const agencies = db.prepare(`
      SELECT a.*, u.username as owner_name, COUNT(am.user_id) as member_count
      FROM agencies a
      LEFT JOIN users u ON a.owner_id = u.id
      LEFT JOIN agency_members am ON a.id = am.agency_id
      GROUP BY a.id
    `).all();
    res.json(agencies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get agency for a specific user
router.get("/user/:userId", (req, res) => {
  const { userId } = req.params;
  try {
    const agency = db.prepare(`
      SELECT a.*, u.username as owner_name
      FROM agencies a
      JOIN agency_members am ON a.id = am.agency_id
      JOIN users u ON a.owner_id = u.id
      WHERE am.user_id = ?
    `).get(userId);
    res.json(agency || null);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
