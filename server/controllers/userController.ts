import db from "../config/db";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "oracle_secret_fallback";

export const registerUser = async (req: any, res: any) => {
  const { username, password, role } = req.body;
  try {
    const existingUser = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const id = Math.random().toString(36).substr(2, 9);
    const userRole = role || "user";
    
    db.prepare("INSERT INTO users (id, username, password, role) VALUES (?, ?, ?, ?)").run(id, username, hashedPassword, userRole);
    
    res.json({ message: "User registered" });
  } catch (error) {
    res.status(500).json({ error: "Registration failed" });
  }
};

export const loginUser = async (req: any, res: any) => {
  const { username, password } = req.body;
  try {
    const user = db.prepare("SELECT * FROM users WHERE username = ?").get(username) as any;
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Check if user is banned
    const ban = db.prepare("SELECT * FROM bans WHERE user_id = ?").get(user.id) as any;
    if (ban) {
      return res.status(403).json({ error: `Your account is banned. Reason: ${ban.reason || "Violating community guidelines"}` });
    }

    const token = jwt.sign({ username: user.username, userId: user.id, role: user.role }, SECRET);
    
    // Track location and device for Whale Identification
    const location = req.headers['cf-ipcountry'] || 'US';
    const device = req.headers['user-agent'] || 'Unknown';
    db.prepare("UPDATE users SET location_iso = ?, device_info = ? WHERE id = ?").run(location, device, user.id);

    res.json({ token, id: user.id, username: user.username, role: user.role });
  } catch (error) {
    res.status(500).json({ error: "Login failed" });
  }
};
