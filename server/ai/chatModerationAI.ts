import { Filter } from "bad-words";

// @ts-ignore
const filter = new Filter();

export interface ChatModerationResult {
  safe: boolean;
  reason?: string;
  severity?: "low" | "medium" | "high" | "critical";
  action?: "warn" | "mute" | "ban" | "shadowban" | "review";
}

export function moderateChat(message: string): ChatModerationResult {
  try {
    if (!message || typeof message !== "string") {
      return { safe: true };
    }
    const blocked = filter.isProfane(message);
    if (blocked) {
      return {
        safe: false,
        reason: "Profanity detected",
        severity: "medium",
        action: "mute",
      };
    }
  } catch (err) {
    console.error("Filter error:", err);
  }
  return {
    safe: true,
  };
}
