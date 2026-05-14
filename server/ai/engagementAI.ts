export interface EngagementParams {
  likes: number;
  comments: number;
  shares: number;
  gifts: number;
  watchTime: number;
}

export function calculateEngagement({
  likes,
  comments,
  shares,
  gifts,
  watchTime,
}: EngagementParams): number {
  return (
    likes * 1 +
    comments * 2 +
    shares * 4 +
    gifts * 8 +
    watchTime * 0.5
  );
}
