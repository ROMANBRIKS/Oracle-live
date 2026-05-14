// In-memory set for shadow banned user IDs
// In production, this should be backed by Redis or DB
const shadowBannedUsers = new Set<string>();

export function shadowBan(userId: string) {
  shadowBannedUsers.add(userId);
}

export function liftShadowBan(userId: string) {
    shadowBannedUsers.delete(userId);
}

export function isShadowBanned(userId: string): boolean {
  return shadowBannedUsers.has(userId);
}
