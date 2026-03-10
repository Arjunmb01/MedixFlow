import app from "./app";
import { connectRedis } from "./infrastructure/cache/redisClient";


const PORT = process.env.PORT || 5000;

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