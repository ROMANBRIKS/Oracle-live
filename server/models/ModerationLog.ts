import db from "../config/db";

export class ModerationLogInstance {
  id?: number;
  userId: string;
  type: "chat" | "stream" | "profile" | "gift";
  reason: string;
  severity: "low" | "medium" | "high" | "critical";
  action: "warn" | "mute" | "ban" | "shadowban" | "review";
  content: string;
  createdAt?: string;

  constructor(data: any) {
    this.id = data.id;
    this.userId = data.userId || data.user_id;
    this.type = data.type || "chat";
    this.reason = data.reason || "";
    this.severity = data.severity || "low";
    this.action = data.action || "warn";
    this.content = data.content || data.message || "";
    this.createdAt = data.created_at || data.createdAt;
  }

  async save(): Promise<ModerationLogInstance> {
    if (this.id !== undefined) {
      db.prepare(`
        UPDATE ai_moderation_logs 
        SET user_id = ?, type = ?, reason = ?, severity = ?, action = ?, content = ?
        WHERE id = ?
      `).run(
        this.userId,
        this.type,
        this.reason,
        this.severity,
        this.action,
        this.content,
        this.id
      );
    } else {
      const info = db.prepare(`
        INSERT INTO ai_moderation_logs (user_id, type, reason, severity, action, content)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        this.userId,
        this.type,
        this.reason,
        this.severity,
        this.action,
        this.content
      );
      this.id = Number(info.lastInsertRowid);
    }
    return this;
  }
}

export const ModerationLog = {
  create: async (data: any): Promise<ModerationLogInstance> => {
    const log = new ModerationLogInstance(data);
    await log.save();
    return log;
  },

  find: async (filter: any = {}): Promise<ModerationLogInstance[]> => {
    let query = "SELECT * FROM ai_moderation_logs";
    const conditions: string[] = [];
    const params: any[] = [];

    if (filter.userId !== undefined || filter.user_id !== undefined) {
      conditions.push("user_id = ?");
      params.push(filter.userId || filter.user_id);
    }
    if (filter.type !== undefined) {
      conditions.push("type = ?");
      params.push(filter.type);
    }
    if (filter.severity !== undefined) {
      conditions.push("severity = ?");
      params.push(filter.severity);
    }
    if (filter.action !== undefined) {
      conditions.push("action = ?");
      params.push(filter.action);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY id DESC";

    const rows = db.prepare(query).all(...params) as any[];
    return rows.map(row => new ModerationLogInstance(row));
  },

  findById: async (id: number): Promise<ModerationLogInstance | null> => {
    const row = db.prepare("SELECT * FROM ai_moderation_logs WHERE id = ?").get(id) as any;
    return row ? new ModerationLogInstance(row) : null;
  }
};

export default ModerationLog;
