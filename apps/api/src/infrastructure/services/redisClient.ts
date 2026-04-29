import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL || "redis://localhost:6379",

  socket: {
    keepAlive: true, 
    reconnectStrategy: (retries) => {
      console.log(`Redis reconnect attempt: ${retries}`);


      return Math.min(retries * 100, 3000);
    },
  },
});


redisClient.on("error", (err) => {
  console.error("Redis Error:", err);
});


redisClient.on("connect", () => {
  console.log("Redis connected");
});


redisClient.on("reconnecting", () => {
  console.log("Redis reconnecting...");
});

redisClient.on("end", () => {
  console.log("Redis connection closed");
});

export async function connectRedis() {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }
}

export default redisClient;
