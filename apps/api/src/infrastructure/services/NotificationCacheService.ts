import { IRedisClient } from "@/infrastructure/interfaces/IRedisClient";
import { NotificationRecord } from "@/domain/value-objects/types/notification.types";

export class NotificationCacheService {
  private readonly UNREAD_COUNT_PREFIX = "notifications:unread_count:";
  private readonly RECENT_LIST_PREFIX = "notifications:recent:";
  private readonly CACHE_TTL = 60 * 60 * 24; // 24 hours

  constructor(private readonly redisClient: IRedisClient) {}

  async getUnreadCount(userId: string): Promise<number | null> {
    const count = await this.redisClient.get(`${this.UNREAD_COUNT_PREFIX}${userId}`);
    return count ? parseInt(count, 10) : null;
  }

  async setUnreadCount(userId: string, count: number): Promise<void> {
    await this.redisClient.set(`${this.UNREAD_COUNT_PREFIX}${userId}`, count.toString(), {
      EX: this.CACHE_TTL,
    });
  }

  async invalidateUnreadCount(userId: string): Promise<void> {
    await this.redisClient.del(`${this.UNREAD_COUNT_PREFIX}${userId}`);
  }

  async getRecentNotifications(userId: string): Promise<NotificationRecord[] | null> {
    const data = await this.redisClient.get(`${this.RECENT_LIST_PREFIX}${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async setRecentNotifications(userId: string, notifications: NotificationRecord[]): Promise<void> {
    await this.redisClient.set(`${this.RECENT_LIST_PREFIX}${userId}`, JSON.stringify(notifications), {
      EX: this.CACHE_TTL,
    });
  }

  async invalidateRecentNotifications(userId: string): Promise<void> {
    await this.redisClient.del(`${this.RECENT_LIST_PREFIX}${userId}`);
  }

  async invalidateAllUserCache(userId: string): Promise<void> {
    await Promise.all([
      this.invalidateUnreadCount(userId),
      this.invalidateRecentNotifications(userId),
    ]);
  }
}
