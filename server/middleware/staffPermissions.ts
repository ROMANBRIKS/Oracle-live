import { Response, NextFunction } from "express";

export type StaffPermission = 'manageUsers' | 'managePayments' | 'manageStreams' | 'manageModeration' | 'manageTreasury';

export default function staffPermissionCheck(permission: StaffPermission) {
  return (req: any, res: Response, next: NextFunction) => {
    if (!req.admin || !req.admin.permissions || !req.admin.permissions[permission]) {
      return res.status(403).json({
        message: `Permission denied - requires ${permission}`,
      });
    }

    next();
  };
}
