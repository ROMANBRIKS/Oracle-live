interface HighlightParams {
  messages: number;
  gifts: number;
}

export interface Highlight {
  start: number;
  end: number;
  title: string;
}

/**
 * Dummy logic for highlight detection based on stream metrics
 */
export function detectHighlights({ messages, gifts }: HighlightParams): Highlight[] {
  const highlights: Highlight[] = [];

  // CHAT SPIKE (Mock logic)
  if (messages > 100) {
    highlights.push({
      start: 120, // 2 minutes in
      end: 180,   // 3 minutes in
      title: "Chat Explosion",
    });
  }

  // GIFT SPIKE (Mock logic)
  if (gifts > 5000) {
    highlights.push({
      start: 300, // 5 minutes in
      end: 360,   // 6 minutes in
      title: "Massive Gift Moment",
    });
  }

  return highlights;
}
