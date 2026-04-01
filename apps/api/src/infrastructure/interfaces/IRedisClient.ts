export interface IRedisClient {
  set(key: string, value: string, options?: { EX?: number }): Promise<string | null>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
}
