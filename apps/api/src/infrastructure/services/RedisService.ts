import { ICacheService } from "@/application/interfaces/ICacheService";
import { IRedisClient } from "@/infrastructure/interfaces/IRedisClient";

export class RedisService implements ICacheService {
  constructor(private readonly redisClient: IRedisClient) {}

  async set<T>(key: string, value: T, ttlSeconds?: number): Promise<void> {
    const stringValue = JSON.stringify(value);
    if (ttlSeconds) {
      await this.redisClient.set(key, stringValue, { EX: ttlSeconds });
    } else {
      await this.redisClient.set(key, stringValue);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redisClient.get(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return value as unknown as T;
    }
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async has(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async clearNamespace(namespace: string): Promise<void> {
    const pattern = `${namespace}:*`;
    const keys = await this.redisClient.keys(pattern);
    if (keys.length > 0) {
      await Promise.all(keys.map(key => this.redisClient.del(key)));
    }
  }

  // Helper for direct redis access if needed (e.g. for sets/incr)
  get client(): IRedisClient {
    return this.redisClient;
  }
}
