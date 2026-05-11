import express, { Request } from "express";
import multer from "multer";
import path from "path";
import db from "../config/db";
import fs from "fs";

interface MulterRequest extends Request {
  files: {
    [fieldname: string]: Express.Multer.File[];
  };
}

const router = express.Router();

// Ensure upload directory exists
const uploadDir = "./uploads/kyc";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// STORAGE
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${req.body.userId || 'anon'}${path.extname(file.originalname)}`);
  },
});

const upload = multer({ storage });

// SUBMIT KYC
router.post(
  "/submit",
  upload.fields([
    { name: "idFront", maxCount: 1 },
    { name: "idBack", maxCount: 1 },
    { name: "selfie", maxCount: 1 },
  ]),
  (req, res) => {
    try {
      const { userId, fullName, country, idType } = req.body;
      const files = (req as unknown as MulterRequest).files;

      if (!files.idFront || !files.idBack || !files.selfie) {
        return res.status(400).json({ message: "Missing required files" });
      }

      const stmt = db.prepare(`
        INSERT INTO kyc_records (user_id, full_name, country, id_type, id_front, id_back, selfie)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `);

      stmt.run(
        userId,
        fullName,
        country,
        idType,
        files.idFront[0].path,
        files.idBack[0].path,
        files.selfie[0].path
      );

      res.json({ success: true, message: "KYC submitted successfully" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "KYC submission failed" });
    }
  }
);

// GET USER KYC STATUS
router.get("/status/:userId", (req, res) => {
  try {
    const record = db.prepare("SELECT * FROM kyc_records WHERE user_id = ? ORDER BY created_at DESC LIMIT 1").get(req.params.userId);
    res.json(record || null);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch KYC status" });
  }
});

// GET ALL KYC (Admin)
router.get("/all", (req, res) => {
  try {
    const records = db.prepare(`
      SELECT k.*, u.username 
      FROM kyc_records k 
      JOIN users u ON k.user_id = u.id 
      ORDER BY k.created_at DESC
    `).all();
    res.json(records);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch KYC records" });
  }
});

// APPROVE KYC
router.post("/approve/:id", (req, res) => {
  try {
    const record = db.prepare("SELECT * FROM kyc_records WHERE id = ?").get(req.params.id) as any;
    if (!record) return res.status(404).json({ message: "KYC not found" });

    db.prepare("UPDATE kyc_records SET status = 'approved' WHERE id = ?").run(req.params.id);
    
    // Notify user
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(record.user_id, "KYC Approved", "Your identity verification has been approved. You now have full access to withdrawals.", "security");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

// REJECT KYC
router.post("/reject/:id", (req, res) => {
  try {
    const { reason } = req.body;
    const record = db.prepare("SELECT * FROM kyc_records WHERE id = ?").get(req.params.id) as any;
    if (!record) return res.status(404).json({ message: "KYC not found" });

    db.prepare("UPDATE kyc_records SET status = 'rejected', rejection_reason = ? WHERE id = ?").run(reason, req.params.id);

    // Notify user
    db.prepare(`
      INSERT INTO notifications (user_id, title, message, type)
      VALUES (?, ?, ?, ?)
    `).run(record.user_id, "KYC Rejected", `Your identity verification was rejected. Reason: ${reason || 'Incomplete documents'}`, "security");

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Rejection failed" });
  }
});

export default router;
