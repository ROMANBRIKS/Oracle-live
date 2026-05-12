import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export interface StaffAdminPayload {
  id: string;
  role: string;
  permissions: {
    manageUsers: boolean;
    managePayments: boolean;
    manageStreams: boolean;
    manageModeration: boolean;
    manageTreasury: boolean;
  };
}

export default async function staffAuth(req: any, res: Response, next: NextFunction) {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized - No token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "oracle_secret_fallback") as StaffAdminPayload;
    req.admin = decoded;

    next();
  } catch (err) {
    console.error("Staff Auth Error:", err);
    res.status(401).json({ message: "Invalid staff token" });
  }
}
