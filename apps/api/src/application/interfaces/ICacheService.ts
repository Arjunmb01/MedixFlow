export interface ICacheService {
  set<T>(key: string, value: T, ttlSeconds?: number): Promise<void>;
  get<T>(key: string): Promise<T | null>;
  delete(key: string): Promise<void>;
  has(key: string): Promise<boolean>;
  clearNamespace(namespace: string): Promise<void>;
}
