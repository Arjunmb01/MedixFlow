import { Request, Response, NextFunction } from "express";
import { IRedisClient } from "@/infrastructure/interfaces/IRedisClient";

export class RateLimiter {
  constructor(private readonly redisClient: IRedisClient) {}

  public limit(options: { 
    windowMs: number; 
    max: number; 
    keyPrefix: string 
  }) {
    return async (req: Request, res: Response, next: NextFunction) => {
      const key = `${options.keyPrefix}:${req.ip}`;
      
      try {
        const currentCount = await this.redisClient.incr(key);
        
        if (currentCount === 1) {
          await this.redisClient.expire(key, Math.ceil(options.windowMs / 1000));
        }

        res.setHeader("X-RateLimit-Limit", options.max);
        res.setHeader("X-RateLimit-Remaining", Math.max(0, options.max - currentCount));

        if (currentCount > options.max) {
          return res.status(429).json({
            success: false,
            message: "Too many requests, please try again later.",
            retryAfter: options.windowMs / 1000
          });
        }

        next();
      } catch (error) {
        console.error("Rate limiter error:", error);
        next(); // Fail open in production if redis is down? Or fail closed? Usually fail open for rate limiting.
      }
    };
  }
}
