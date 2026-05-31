import { ILockService } from "@/application/interfaces/ILockService";
import { IRedisClient } from "@/infrastructure/interfaces/IRedisClient";

export class DistributedLockService implements ILockService {
  constructor(private readonly redisClient: IRedisClient) {}

  async acquireLock(key: string, ttlMs: number): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const result = await this.redisClient.set(lockKey, "locked", {
      EX: Math.ceil(ttlMs / 1000),
      NX: true
    });
    return result === "OK";
  }

  async releaseLock(key: string): Promise<void> {
    const lockKey = `lock:${key}`;
    await this.redisClient.del(lockKey);
  }

  async isLocked(key: string): Promise<boolean> {
    const lockKey = `lock:${key}`;
    const result = await this.redisClient.exists(lockKey);
    return result === 1;
  }
}
