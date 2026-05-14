export interface SpamDetectionParams {
  messagesPerMinute: number;
  repeatedMessages: number;
}

export interface SpamDetectionResult {
  spam: boolean;
  action?: "mute" | "warn";
}

export function detectSpam({
  messagesPerMinute,
  repeatedMessages,
}: SpamDetectionParams): SpamDetectionResult {
  if (messagesPerMinute > 20 || repeatedMessages > 5) {
    return {
      spam: true,
      action: "mute",
    };
  }
  return {
    spam: false,
  };
}
