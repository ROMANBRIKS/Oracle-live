import { Queue } from "bullmq";
import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

let livestreamQueue: Queue | null = null;
let payoutQueue: Queue | null = null;

try {
  const connection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
    connectTimeout: 2000,
  });

  connection.on("error", (err) => {
    // Graceful logging without crashing
    console.warn("⚠️ BullMQ Redis Connection Error:", err.message);
  });

  livestreamQueue = new Queue("livestreamQueue", { connection });
  payoutQueue = new Queue("payoutQueue", { connection });
} catch (e) {
  console.warn("⚠️ BullMQ initialization failed (offline):", e);
}

export { livestreamQueue, payoutQueue };
