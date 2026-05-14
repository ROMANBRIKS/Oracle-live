export interface StreamServer {
  id: number;
  url: string;
  active: boolean;
  region: string;
  load: number;
}

const streamServers: StreamServer[] = [
  { id: 1, url: "rtmp://edge-01.oracle-live.io/live", active: true, region: "US-East", load: 0.1 },
  { id: 2, url: "rtmp://edge-02.oracle-live.io/live", active: true, region: "EU-West", load: 0.4 },
  { id: 3, url: "rtmp://edge-03.oracle-live.io/live", active: true, region: "Asia-Pacific", load: 0.2 },
];

/**
 * Returns the best available server based on health and load
 */
export function getAvailableServer(): StreamServer | undefined {
  return streamServers
    .filter(s => s.active)
    .sort((a, b) => a.load - b.load)[0];
}

export default { getAvailableServer };
