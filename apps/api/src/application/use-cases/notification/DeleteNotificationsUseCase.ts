import { INotificationRepository } from "@/domain/repositories/INotificationRepository";
import { NotificationCacheService } from "@/infrastructure/services/NotificationCacheService";
import { SocketService } from "@/infrastructure/services/SocketService";

export class DeleteNotificationsUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly cacheService: NotificationCacheService,
    private readonly socketService: SocketService
  ) {}

  async execute(userId: string) {
    // Delete all from DB
    await this.notificationRepo.deleteAll(userId);

    // Update Cache
    const newCount = 0;
    await this.cacheService.setUnreadCount(userId, newCount);
    await this.cacheService.invalidateRecentNotifications(userId);

    // Notify other tabs via Socket
    this.socketService.sendUnreadCountUpdate(userId, newCount);
  }
}
