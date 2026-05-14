import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

let redisClient: Redis | null = null;

try {
  redisClient = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
    enableOfflineQueue: true,
    connectTimeout: 2000,
  });

  redisClient.on("connect", () => {
    console.log("Redis connected successfully.");
  });

  redisClient.on("error", (err) => {
    console.warn("⚠️ Redis Error (falling back to offline mode):", err.message);
  });
} catch (e) {
  console.warn("⚠️ Failed to initialize Redis client:", e);
}

export default redisClient;
