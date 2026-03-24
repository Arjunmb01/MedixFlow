import { PrismaClient } from "@prisma/client";
import { INotificationRepository } from "@/domain/repositories/INotificationRepository";

export class NotificationRepository implements INotificationRepository {
    constructor(private readonly prisma : PrismaClient){}

    async createMany(data: { userId: string; title: string; message: string; type: string }[]) {
        await this.prisma.notification.createMany({
            data,
        })
    }

    async create(data: { userId: string; title: string; message: string; type: string }) {
        return this.prisma.notification.create({
            data,
        })
    }

    async findByUserId(userId: string) {
        return this.prisma.notification.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
    }
}