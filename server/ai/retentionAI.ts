export interface RetentionParams {
  joinedUsers: number;
  stayedUsers: number;
}

export function calculateRetention({
  joinedUsers,
  stayedUsers,
}: RetentionParams): number {
  if (joinedUsers === 0) return 0;
  return parseFloat(((stayedUsers / joinedUsers) * 100).toFixed(2));
}
