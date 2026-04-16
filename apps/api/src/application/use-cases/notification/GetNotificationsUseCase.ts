import { INotificationRepository } from "@/domain/repositories/INotificationRepository";
import { NotificationCacheService } from "@/infrastructure/services/NotificationCacheService";

export class GetNotificationsUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly cacheService: NotificationCacheService
  ) {}

  async execute(userId: string, limit: number = 10, offset: number = 0) {

    if (offset === 0 && limit <= 20) {
      const cached = await this.cacheService.getRecentNotifications(userId);
      if (cached) return cached;
    }

    const notifications = await this.notificationRepo.getUserNotifications(userId, limit, offset);

    if (offset === 0) {
      await this.cacheService.setRecentNotifications(userId, notifications);
    }

    return notifications;
  }
}
