import express from "express";
import db from "../config/db";
import { v4 as uuidv4 } from "uuid";
import { joinAgency } from "../utils/agencyEngine";

const router = express.Router();

// CREATE AGENCY
router.post("/create", (req, res) => {
  try {
    const { name, logo, ownerId, description, region, commissionRate } = req.body;
    const id = uuidv4();
    
    db.prepare(`
      INSERT INTO agencies (id, name, logo, owner_id, description, region, commission_rate)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, name, logo, ownerId, description, region || 'global', commissionRate || 10.0);

    const agency = db.prepare("SELECT * FROM agencies WHERE id = ?").get(id);
    res.json({ success: true, agency });
  } catch (err: any) {
    res.status(500).json({ message: "Failed to create agency", error: err.message });
  }
});

// JOIN AGENCY
router.post("/join", async (req, res) => {
  try {
    const { agencyId, creatorId } = req.body;
    const member = await joinAgency({ agencyId, creatorId });
    if (!member) return res.status(404).json({ message: "Agency not found" });
    
    res.json({ success: true, member });
  } catch (err: any) {
    res.status(500).json({ message: "Join failed", error: err.message });
  }
});

// GET AGENCY MEMBERS
router.get("/members/:agencyId", (req, res) => {
  try {
    const { agencyId } = req.params;
    const members = db.prepare(`
      SELECT am.*, u.username, u.avatar 
      FROM agency_members am
      JOIN users u ON am.creator_id = u.id
      WHERE am.agency_id = ?
    `).all(agencyId);

    res.json(members);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch members", error: err.message });
  }
});

// GET ALL AGENCIES (for discovery)
router.get("/", (req, res) => {
  try {
    const agencies = db.prepare("SELECT * FROM agencies ORDER BY total_creators DESC").all();
    res.json(agencies);
  } catch (err: any) {
    res.status(500).json({ message: "Failed to fetch agencies" });
  }
});

export default router;
