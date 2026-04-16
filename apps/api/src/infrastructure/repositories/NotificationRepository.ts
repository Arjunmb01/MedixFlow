import { PrismaClient } from "@prisma/client";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { NotificationRecord, CreateNotificationInput } from "../../domain/value-objects/types/notification.types";
import { NotificationMapper } from "../database/mappers/NotificationMapper";

export class NotificationRepository implements INotificationRepository {
  constructor(
    private readonly prisma: PrismaClient,
    private readonly mapper: NotificationMapper
  ) {}

  async create(data: CreateNotificationInput): Promise<NotificationRecord> {
    const result = await this.prisma.notification.create({
      data: {
        recipientId: data.recipientId,
        title: data.title,
        message: data.message,
        type: data.type,
      },
    });
    return this.mapper.toRecord(result);
  }

  async getUserNotifications(userId: string, limit: number = 20, offset: number = 0): Promise<NotificationRecord[]> {
    const results = await this.prisma.notification.findMany({
      where: { recipientId: userId },
      orderBy: { createdAt: "desc" },
      take: limit,
      skip: offset,
    });
    return results.map((r) => this.mapper.toRecord(r));
  }

  async getUnreadCount(userId: string): Promise<number> {
    return this.prisma.notification.count({
      where: {
        recipientId: userId,
        isRead: false,
      },
    });
  }

  async markAsRead(notificationId: string): Promise<NotificationRecord> {
    const result = await this.prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
    return this.mapper.toRecord(result);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.prisma.notification.updateMany({
      where: { recipientId: userId, isRead: false },
      data: { isRead: true },
    });
  }

  async deleteAll(userId: string): Promise<void> {
    await this.prisma.notification.deleteMany({
      where: { recipientId: userId },
    });
  }

  async findById(id: string): Promise<NotificationRecord | null> {
    const result = await this.prisma.notification.findUnique({
      where: { id },
    });
    return result ? this.mapper.toRecord(result) : null;
  }
}
