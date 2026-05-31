export interface ILockService {
  acquireLock(key: string, ttlMs: number): Promise<boolean>;
  releaseLock(key: string): Promise<void>;
  isLocked(key: string): Promise<boolean>;
}
