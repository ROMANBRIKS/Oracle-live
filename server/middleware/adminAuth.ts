import { Request, Response, NextFunction } from "express";
import { hasPermission } from "../utils/permissionEngine";

export default function adminAuth(permission: string) {
  return async (req: any, res: Response, next: NextFunction) => {
    try {
      if (!req.user || !req.user.userId) {
        return res.status(401).json({ message: "Authentication required" });
      }

      const userId = req.user.userId;
      const allowed = await hasPermission(userId, permission);

      if (!allowed) {
        return res.status(403).json({ message: "Permission denied: Requires " + permission });
      }

      next();
    } catch (err) {
      res.status(500).json({ message: "Server error during permission check" });
    }
  };
}
