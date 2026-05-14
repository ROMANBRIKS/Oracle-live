import { Kafka } from "kafkajs";

const KAFKA_BROKER = process.env.KAFKA_BROKER || "localhost:9092";

let producer: any = null;
let consumer: any = null;

try {
  const kafka = new Kafka({
    clientId: "hlx-platform",
    brokers: [KAFKA_BROKER],
    connectionTimeout: 2000,
  });

  producer = kafka.producer();
  consumer = kafka.consumer({
    groupId: "hlx-group",
  });

  producer.connect().catch((err: any) => {
    console.warn("⚠️ Kafka Producer connection failed:", err.message);
  });
} catch (e) {
  console.warn("⚠️ Kafka initialization failed:", e);
}

export { producer, consumer };
