import jwt from "jsonwebtoken";
import db from "../config/db";

const SECRET = process.env.JWT_SECRET || "oracle_secret_fallback";

export default function auth(req: any, res: any, next: any) {
  let token = req.headers.authorization;
  
  if (token?.startsWith("Bearer ")) {
    token = token.split(" ")[1];
  }

  if (!token) {
    console.error("Auth Failure: No token provided");
    return res.status(401).json({
      error: "No token admitted",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET) as any;
    
    // VERIFY USER EXISTS IN DB
    // Support both userId and id for backward compatibility/flexibility
    const identifier = decoded.userId || decoded.id;

    if (!identifier) {
       console.error("Auth Failure: Token payload missing identification (userId/id)");
       return res.status(401).json({ error: "Invalid token payload" });
    }

    const user = db.prepare("SELECT id FROM users WHERE id = ?").get(identifier);
    const staff = !user ? db.prepare("SELECT id FROM staff_admins WHERE id = ?").get(identifier) : null;

    if (!user && !staff) {
      console.warn(`Auth Failure: Ghost user ${identifier} detected. User not found in database.`);
      return res.status(401).json({
        error: "Unauthorized",
        details: "User account no longer exists. Please log in again."
      });
    }

    req.user = decoded;
    next();
  } catch (err: any) {
    console.error("Auth Failure: Invalid token", err.message);
    return res.status(401).json({
      error: "Invalid token",
      details: err.message
    });
  }
}
