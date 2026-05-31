import { createClient, RedisClientType } from "redis";

const redisClient: RedisClientType = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",
  socket: {
    keepAlive: true, 
    reconnectStrategy: (retries) => {
      const delay = Math.min(retries * 100, 3000);
      console.log(`Redis reconnecting in ${delay}ms... (Attempt ${retries})`);
      return delay;
    },
  },
});

redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});

redisClient.on("connect", () => {
  console.info("Redis: Connection established successfully");
});

redisClient.on("reconnecting", () => {
  console.info("Redis: Reconnecting to server...");
});

redisClient.on("end", () => {
  console.warn("Redis: Connection closed");
});

export async function connectRedis(): Promise<void> {
  try {
    if (!redisClient.isOpen) {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("Failed to connect to Redis:", error);
    process.exit(1); // Production-grade: exit if critical infra fails
  }
}

export { redisClient };
export default redisClient;
