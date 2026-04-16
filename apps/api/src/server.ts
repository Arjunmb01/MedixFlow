import { config } from "./infrastructure/services/config";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import app from "./app";
import { connectRedis } from "./infrastructure/services/redisClient";
import { createServer } from "http";
import { socketService } from "./infrastructure/services/SocketService";

const PORT = config.port || 5000;
const httpServer = createServer(app);

async function startServer() {
  try {
    await connectRedis();

    socketService.initialize(httpServer);

    httpServer.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error);
  }
}

startServer();