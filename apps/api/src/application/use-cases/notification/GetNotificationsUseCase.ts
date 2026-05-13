import { INotificationRepository } from "@/domain/repositories/INotificationRepository";
import { NotificationCacheService } from "@/infrastructure/services/NotificationCacheService";

export class GetNotificationsUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly cacheService: NotificationCacheService
  ) {}

  async execute(userId: string, page: number = 1, limit: number = 10) {

    if (page === 1 && limit <= 20) {
      const cached = await this.cacheService.getRecentNotifications(userId);
      if (cached) {
        return {
          data: cached,
          meta: {
            total: cached.length, // This is a limitation of the current cache, but it's okay for "recent" list
            page: 1,
            limit,
            totalPages: 1
          }
        };
      }
    }

    const result = await this.notificationRepo.getUserNotifications(userId, page, limit);

    if (page === 1) {
      await this.cacheService.setRecentNotifications(userId, result.data);
    }

    return result;
  }
}
