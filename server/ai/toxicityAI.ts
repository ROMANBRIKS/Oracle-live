export interface ToxicityResult {
  toxic: boolean;
  severity: "low" | "medium" | "high" | "critical";
}

export function detectToxicity(message: string): ToxicityResult {
  if (!message || typeof message !== "string") {
    return { toxic: false, severity: "low" };
  }

  const toxicWords = ["hate", "kill", "scam", "fraud", "scammer", "nuke", "die"];

  const detected = toxicWords.some((word) =>
    message.toLowerCase().includes(word)
  );

  return {
    toxic: detected,
    severity: detected ? "high" : "low",
  };
}
