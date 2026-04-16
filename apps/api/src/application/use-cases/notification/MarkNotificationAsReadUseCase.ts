import { INotificationRepository } from "@/domain/repositories/INotificationRepository";
import { NotificationCacheService } from "@/infrastructure/services/NotificationCacheService";
import { SocketService } from "@/infrastructure/services/SocketService";

export class MarkNotificationAsReadUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly cacheService: NotificationCacheService,
    private readonly socketService: SocketService
  ) {}

  async execute(userId: string, notificationId?: string) {
    if (notificationId) {
      // Mark single as read
      await this.notificationRepo.markAsRead(notificationId);
    } else {
      // Mark all as read
      await this.notificationRepo.markAllAsRead(userId);
    }

    // Update Cache
    const newCount = await this.notificationRepo.getUnreadCount(userId);
    await this.cacheService.setUnreadCount(userId, newCount);
    await this.cacheService.invalidateRecentNotifications(userId);

    // Notify other tabs via Socket
    this.socketService.sendUnreadCountUpdate(userId, newCount);
  }
}
