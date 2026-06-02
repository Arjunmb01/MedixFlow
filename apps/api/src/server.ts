import { mark, report } from "./shared/startupProfiler";

mark("__start__");

import { env as config } from "./shared/config/env";
mark("env_loaded");

import app, { mountApiRoutes } from "./app";
mark("express_app_loaded");

import { connectRedis } from "./infrastructure/services/redisClient";
import { createServer } from "http";
import { socketService } from "./infrastructure/services/SocketService";

const PORT = config.PORT || 5000;
const httpServer = createServer(app);

async function startBackgroundServices(): Promise<void> {
  try {
    await connectRedis();
    mark("redis_connected");

    const { getContainer } = await import(
      "./infrastructure/services/container/CompositionRoot"
    );
    const container = getContainer();
    socketService.initialize(httpServer, container.consultationSignalingHandler);
    mark("socket_initialized");

    container.appointmentCleanupService.start();
    mark("cron_started");
  } catch (error) {
    console.error("Background services failed (Redis/Socket/Cron):", error);
  }
}

async function mountRoutesInBackground(): Promise<void> {
  try {
    mark("routes_mount_start");
    await mountApiRoutes();
    mark("routes_mounted");
    console.log("API routes ready.");
    report();
  } catch (error) {
    console.error("Failed to mount API routes:", error);
    process.exit(1);
  }
}

function startServer(): void {
  httpServer.listen(PORT, () => {
    mark("listening");
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(`  CORS allowed origins: ${config.ALLOWED_ORIGINS.join(", ") || "(none)"}`);
    console.log("  GET /health — ready now");
    console.log("  /api/*     — loading (see 'API routes ready' below)...\n");

    void mountRoutesInBackground();
    void startBackgroundServices();
  });
}

startServer();
