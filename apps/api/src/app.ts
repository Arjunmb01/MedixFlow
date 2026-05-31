/// <reference path="./core/types/express.d.ts" />
import express from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { env } from "./shared/config/env";
import { errorMiddleware } from "./shared/middlewares/error.middleware";

const app = express();
app.set("trust proxy", 1); // Enable accurate IP identification behind proxies (Render/Nginx)

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true,
  })
);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
    crossOriginEmbedderPolicy: false,
  })
);
app.use(cookieParser());

<<<<<<< HEAD
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

// Stripe webhook needs raw body BEFORE express.json()
app.post(
  "/api/payments/webhook/stripe",
  express.raw({ type: "application/json" }),
  (req, res, next) => {
    (req as express.Request & { rawBody?: Buffer }).rawBody = req.body as Buffer;
    next();
  }
);

app.use(
  express.json({
    verify: (req, _res, buf) => {
      (req as express.Request & { rawBody?: Buffer }).rawBody = buf;
    },
  })
);

let routesMounted = false;

app.use("/api", (_req, res, next) => {
  if (!routesMounted) {
    res.status(503).json({
      status: "starting",
      message: "API routes are still loading. Retry in a few seconds.",
    });
    return;
  }
=======
app.post("/api/payments/webhook/stripe", express.raw({ type: 'application/json' }), (req, res, next) => {
  (req as any).rawBody = req.body;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
  next();
});

/** Mount API routes after HTTP stack is ready — defers CompositionRoot assembly. */
export async function mountApiRoutes(): Promise<void> {
  if (routesMounted) return;
  const { default: createApiRouter } = await import("./presentation/routes");
  app.use("/api", createApiRouter());
  app.use(errorMiddleware);
  routesMounted = true;
}

export default app;
