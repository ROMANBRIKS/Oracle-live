export interface ShouldNotifyParams {
  aiViralScore: number;
  viewerInterest: number;
}

export function shouldNotify({
  aiViralScore,
  viewerInterest,
}: ShouldNotifyParams): boolean {
  return aiViralScore > 70 && viewerInterest > 50;
}
