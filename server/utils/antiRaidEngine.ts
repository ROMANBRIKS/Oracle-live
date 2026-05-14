const raidTracker: Record<string, number> = {};

export function detectRaid({
  roomId,
  joins,
}: {
  roomId: string;
  joins: number;
}): boolean {
  if (!raidTracker[roomId]) {
    raidTracker[roomId] = 0;
  }

  raidTracker[roomId] += joins;

  // Threshold: more than 100 joins in a short window (logic simplified here)
  if (raidTracker[roomId] > 100) {
    return true;
  }

  // Auto-reset tracker for room after some time (in a real app, use a proper sliding window)
  setTimeout(() => {
    if (raidTracker[roomId]) raidTracker[roomId] -= joins;
  }, 10000);

  return false;
}

export function resetRaidTracker(roomId: string) {
    delete raidTracker[roomId];
}
