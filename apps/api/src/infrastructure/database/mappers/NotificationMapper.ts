import { Notification } from "@prisma/client";
import { NotificationRecord, NotificationType } from "../../../domain/value-objects/types/notification.types";

export class NotificationMapper {
  toRecord(p: Notification): NotificationRecord {
    return {
      id: p.id,
      recipientId: p.recipientId,
      title: p.title,
      message: p.message,
      type: p.type as NotificationType,
      isRead: p.isRead,
      createdAt: p.createdAt,
    };
  }
}
