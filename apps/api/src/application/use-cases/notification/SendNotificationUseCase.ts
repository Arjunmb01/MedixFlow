import { INotificationRepository } from "@/domain/repositories/INotificationRepository";
import { CreateNotificationInput, NotificationType } from "@/domain/value-objects/types/notification.types";
import { NotificationCacheService } from "@/infrastructure/services/NotificationCacheService";
import { SocketService } from "@/infrastructure/services/SocketService";

export class SendNotificationUseCase {
  constructor(
    private readonly notificationRepo: INotificationRepository,
    private readonly cacheService: NotificationCacheService,
    private readonly socketService: SocketService
  ) {}

  async execute(input: CreateNotificationInput) {
    // 1. Persist to DB
    const notification = await this.notificationRepo.create(input);

    // 2. Invalidate / Update Cache
    const newCount = await this.notificationRepo.getUnreadCount(input.recipientId);
    await this.cacheService.setUnreadCount(input.recipientId, newCount);
    await this.cacheService.invalidateRecentNotifications(input.recipientId);

    // 3. Emit via Socket
    this.socketService.sendNotification(input.recipientId, notification);
    this.socketService.sendUnreadCountUpdate(input.recipientId, newCount);

    return notification;
  }
}
