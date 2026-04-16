import { NotificationRecord, CreateNotificationInput } from "../value-objects/types/notification.types";

export interface INotificationRepository {
  create(data: CreateNotificationInput): Promise<NotificationRecord>;
  getUserNotifications(userId: string, limit?: number, offset?: number): Promise<NotificationRecord[]>;
  getUnreadCount(userId: string): Promise<number>;
  markAsRead(notificationId: string): Promise<NotificationRecord>;
  markAllAsRead(userId: string): Promise<void>;
  deleteAll(userId: string): Promise<void>;
  findById(id: string): Promise<NotificationRecord | null>;
}
