import { createAdapter } from "@socket.io/redis-adapter";
import { createClient } from "redis";

export async function setupSocketCluster(io: any) {
  const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";
  try {
    const pubClient = createClient({ url: REDIS_URL });
    const subClient = pubClient.duplicate();

    pubClient.on("error", (err) => {
      console.warn("⚠️ Socket pubClient error (offline mode):", err.message);
    });
    subClient.on("error", (err) => {
      console.warn("⚠️ Socket subClient error (offline mode):", err.message);
    });

    await pubClient.connect();
    await subClient.connect();

    io.adapter(createAdapter(pubClient, subClient));
    console.log("🚀 SocketCluster: Distributed Redis Socket Adapter registered.");
  } catch (error: any) {
    console.warn("⚠️ SocketCluster: Distributed Redis Adapter registration failed, using native socket adapter.", error.message);
  }
}
