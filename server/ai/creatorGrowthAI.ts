export interface CreatorGrowthParams {
  followers: number;
  engagement: number;
  consistency: number;
}

export function predictCreatorGrowth({
  followers,
  engagement,
  consistency,
}: CreatorGrowthParams): number {
  return parseFloat(
    (followers * 0.3 + engagement * 0.5 + consistency * 0.2).toFixed(1)
  );
}
