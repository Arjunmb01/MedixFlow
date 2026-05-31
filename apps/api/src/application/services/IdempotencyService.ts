import { ICacheService } from "@/application/interfaces/ICacheService";

export class IdempotencyService {
  constructor(private readonly cacheService: ICacheService) {}

  /**
   * Checks if an operation has already been processed.
   * If not, marks it as "processing" with a TTL.
   */
  async tryProcess(key: string, ttlSeconds: number = 86400): Promise<boolean> {
    const fullKey = `idempotency:${key}`;
    const existing = await this.cacheService.get(fullKey);
    
    if (existing) {
      return false; // Already processed or processing
    }

    // Set a "processing" flag
    await this.cacheService.set(fullKey, { status: "processing", timestamp: Date.now() }, ttlSeconds);
    return true;
  }

  /**
   * Marks an operation as successfully completed.
   */
  async complete<T>(key: string, result: T, ttlSeconds: number = 86400): Promise<void> {
    const fullKey = `idempotency:${key}`;
    await this.cacheService.set(fullKey, { status: "completed", result, timestamp: Date.now() }, ttlSeconds);
  }

  /**
   * Fails an operation (e.g. so it can be retried).
   */
  async fail(key: string): Promise<void> {
    const fullKey = `idempotency:${key}`;
    await this.cacheService.delete(fullKey);
  }

  /**
   * Gets the result of a completed operation.
   */
  async getResult<T>(key: string): Promise<T | null> {
    const fullKey = `idempotency:${key}`;
    const data = await this.cacheService.get<{ status: string; result: T }>(fullKey);
    return data?.status === "completed" ? data.result : null;
  }
}
