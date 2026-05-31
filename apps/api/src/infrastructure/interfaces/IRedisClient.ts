export interface IRedisClient {
  set(key: string, value: string, options?: { EX?: number; NX?: boolean }): Promise<string | null>;
  get(key: string): Promise<string | null>;
  del(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<number>;
  incr(key: string): Promise<number>;
  sAdd(key: string, value: string): Promise<number>;
  sRem(key: string, value: string): Promise<number>;
  sMembers(key: string): Promise<string[]>;
  keys(pattern: string): Promise<string[]>;
  exists(key: string): Promise<number>;
}
