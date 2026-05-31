import { NotificationRecord, CreateNotificationInput } from "../value-objects/types/notification.types";
import { PaginatedResponse } from "../value-objects/types/pagination.types";
export { PaginatedResponse };

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<NotificationRecord>;
  getUserNotifications(userId: string, page?: number, limit?: number): Promise<PaginatedResponse<NotificationRecord>>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<NotificationRecord>;
  markAllAsRead(userId: string): Promise<void>;
  deleteAll(userId: string): Promise<void>;
  findById(id: string): Promise<NotificationRecord | null>;
}
