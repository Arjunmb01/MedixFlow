import { INotificationRepository } from "@/domain/repositories/INotificationRepository";
import { NotificationCacheService } from "@/infrastructure/services/NotificationCacheService";

export class GetUnreadCountUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly cacheService: NotificationCacheService
  ) {}

  async execute(userId: string): Promise<number> {
    const cachedCount = await this.cacheService.getUnreadCount(userId);
    if (cachedCount !== null) return cachedCount;

    const count = await this.notificationRepo.getUnreadCount(userId);
    await this.cacheService.setUnreadCount(userId, count);
    return count;
  }
}
