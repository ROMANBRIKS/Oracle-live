/**
 * Adaptive Bitrate Engine
 * Determines the target quality based on network speed (Mbps)
 */
export function getBitrate(speedMbps: number): "480p" | "720p" | "1080p" {
  if (speedMbps < 2) return "480p";
  if (speedMbps < 5) return "720p";
  return "1080p";
}

export default { getBitrate };
