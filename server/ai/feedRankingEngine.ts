export function rankStreams(
  streams: any[],
  userPreferences?: any
): any[] {
  return [...streams].sort((a, b) => {
    const scoreA = a.aiViralScore ?? a.ai_viral_score ?? 0;
    const scoreB = b.aiViralScore ?? b.ai_viral_score ?? 0;
    return scoreB - scoreA;
  });
}
