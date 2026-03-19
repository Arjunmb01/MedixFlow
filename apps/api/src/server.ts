import { config } from "./core/config";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./app";
import { connectRedis } from "./infrastructure/cache/redisClient";

const PORT = config.port || 5000;
console.log("DB:", process.env.DATABASE_URL);

async function startServer() {
  try {
    await connectRedis();

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
  }
}

startServer();