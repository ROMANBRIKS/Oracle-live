import { Worker } from "bullmq";
import Redis from "ioredis";

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = parseInt(process.env.REDIS_PORT || "6379");

let worker: Worker | null = null;

try {
  const connection = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    maxRetriesPerRequest: null,
    connectTimeout: 2000,
  });

  connection.on("error", (err) => {
    console.warn("⚠️ Payout Worker Redis Connection Error:", err.message);
  });

  worker = new Worker(
    "payoutQueue",
    async (job) => {
      console.log("[WORKER] Processing background payout task:", job.id, job.data);
      // Integration hook ready for Paystack / Crypto Payout orchestration
    },
    { connection }
  );

  worker.on("completed", (job) => {
    console.log(`[WORKER] Job ${job.id} completed successfully.`);
  });

  worker.on("failed", (job, error) => {
    console.warn(`[WORKER] Job ${job?.id} failed:`, error.message);
  });
} catch (e: any) {
  console.warn("⚠️ Payout Worker registration failed:", e.message);
}

export default worker;
