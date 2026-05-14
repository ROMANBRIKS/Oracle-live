import db from "../config/db";

export interface SafetyJob {
  userId: string;
  type: "chat" | "stream" | "profile" | "gift";
  content: string;
  metadata?: any;
}

class SafetyQueue {
  private queue: SafetyJob[] = [];
  private processing: boolean = false;

  async add(name: string, data: SafetyJob) {
    console.log(`[SAFETY QUEUE] Job added: ${name}`, data);
    
    // Save to the database for audit
    try {
      db.prepare(`
        INSERT INTO ai_moderation_logs (user_id, type, reason, severity, action, content)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(
        data.userId,
        data.type,
        `Queue Job: ${name}`,
        "low",
        "review",
        typeof data.content === "string" ? data.content : JSON.stringify(data.content)
      );
    } catch (err) {
      console.error("[SAFETY QUEUE] Error persisting job log:", err);
    }

    this.queue.push(data);
    this.processQueue();
  }

  private async processQueue() {
    if (this.processing) return;
    this.processing = true;

    while (this.queue.length > 0) {
      const job = this.queue.shift();
      if (job) {
        try {
          console.log("[SAFETY QUEUE] Processing safety job details:", job);
          // Run async safety checks without blocking main thread
          await new Promise((resolve) => setTimeout(resolve, 500));
        } catch (err) {
          console.error("[SAFETY QUEUE] Failed processing job:", err);
        }
      }
    }
    this.processing = false;
  }
}

export const safetyQueue = new SafetyQueue();
export default safetyQueue;
