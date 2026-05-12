import db from "../config/db";

interface AdminAuditParams {
  adminId: string;
  action: string;
  targetId?: string;
  targetType?: string;
  metadata?: any;
  ipAddress?: string;
}

export async function logAdminAction({
  adminId,
  action,
  targetId,
  targetType,
  metadata,
  ipAddress,
}: AdminAuditParams) {
  try {
    db.prepare(`
      INSERT INTO admin_audit_logs (admin_id, action, target_id, target_type, metadata, ip_address)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      adminId,
      action,
      targetId || null,
      targetType || null,
      metadata ? JSON.stringify(metadata) : null,
      ipAddress || null
    );
  } catch (err) {
    console.error("Failed to log admin action:", err);
  }
}
