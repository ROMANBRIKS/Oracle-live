import db from "../config/db";

/**
 * Checks if a user has a specific permission.
 * Super admins have all permissions.
 */
export async function hasPermission(userId: string, permission: string): Promise<boolean> {
  try {
    // Check if the user is a staff admin
    const admin = db.prepare("SELECT * FROM staff_admins WHERE id = ? AND active = 1").get(userId) as any;

    if (!admin) {
      // Check if they are a "super" admin from the main users table (fallback for initial admin)
      const user = db.prepare("SELECT role FROM users WHERE id = ?").get(userId) as any;
      if (user && user.role === 'admin') return true;
      return false;
    }

    if (admin.role === "super_admin") {
      return true;
    }

    const permissions = JSON.parse(admin.permissions || "[]");
    return permissions.includes(permission);
  } catch (err) {
    console.error("Permission check failed:", err);
    return false;
  }
}
