/// <reference path="./core/types/express.d.ts" />
import express, { Request, Response, NextFunction } from "express";

import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import router from "./presentation/routes";
import { env } from "./shared/config/env";
import { errorMiddleware } from "./shared/middlewares/error.middleware";

const app = express();

app.use(
  cors({
    origin: env.ALLOWED_ORIGINS,
    credentials: true
  })
);

app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" },
  crossOriginEmbedderPolicy: false
}));
app.use(cookieParser());

// Stripe webhook needs raw body BEFORE express.json()
app.post("/api/payments/webhook/stripe", express.raw({ type: 'application/json' }), (req, res, next) => {
  (req as any).rawBody = req.body;
  next();
});

app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf;
  }
}));

app.use("/api", router);


app.use(errorMiddleware);

export default app;
