/// <reference path="./core/types/express.d.ts" />
import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import { ZodError } from "zod";
import router from "./routes";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true
  })
)

app.use(helmet());
app.use(cookieParser());
app.use(express.json());


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