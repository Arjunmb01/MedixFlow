/// <reference path="./core/types/express.d.ts" />
import express, { Request, Response, NextFunction } from "express";

import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import router from "./presentation/routes";
import { config } from "./infrastructure/services/config";

const app = express();

app.use(
  cors({
    origin: config.allowedOrigins,
    credentials: true
  })
)

app.use(helmet({ 
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "same-origin-allow-popups" }
}));
app.use(cookieParser());
app.use(express.json({
  verify: (req: any, res, buf) => {
    req.rawBody = buf.toString();
  }
}));

app.use("/api", router);


app.use((err: unknown, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: "Validation Error",
      errors: err.issues.map((issue) => ({
        path: issue.path.join("."),
        message: issue.message,
      })),
    });
  }

  const status = (err as { status?: number })?.status || 500;
  const message = (err as Error)?.message || "Internal Server Error";

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({
    success: false,
    message,
  });
});

export default app;
