const bannedWords = [
  "spam",
  "scam",
  "hate",
  "toxic",
  "cheat",
  "abuse"
];

export function detectToxicity(message: string): boolean {
  if (!message || typeof message !== 'string') return false;
  const lower = message.toLowerCase();
  return bannedWords.some((word) => lower.includes(word));
}

export function detectSpam({
  messageCount,
  seconds,
}: {
  messageCount: number;
  seconds: number;
}): boolean {
  // Threshold: more than 10 messages in 5 seconds
  return messageCount > 10 && seconds < 5;
}
