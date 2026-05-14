export interface ViralPredictionParams {
  engagement: number;
  retention: number;
  shares: number;
}

export function predictVirality({
  engagement,
  retention,
  shares,
}: ViralPredictionParams): number {
  // Returns a score out of 100 or unbounded. Usually normalized. 
  const score = (engagement * 0.4) + (retention * 0.4) + (shares * 0.2);
  return Math.min(100, Math.max(0, parseFloat(score.toFixed(2))));
}
