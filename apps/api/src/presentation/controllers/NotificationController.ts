import { Request, Response } from "express";
import { GetNotificationsUseCase } from "@/application/use-cases/notification/GetNotificationsUseCase";
import { MarkNotificationAsReadUseCase } from "@/application/use-cases/notification/MarkNotificationAsReadUseCase";
import { GetUnreadCountUseCase } from "@/application/use-cases/notification/GetUnreadCountUseCase";
import { DeleteNotificationsUseCase } from "@/application/use-cases/notification/DeleteNotificationsUseCase";
import { StatusCode } from "@/shared/constants";

export class NotificationController {
  constructor(
    private readonly getNotificationsUseCase: GetNotificationsUseCase,
    private readonly markAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly getUnreadCountUseCase: GetUnreadCountUseCase,
    private readonly deleteNotificationsUseCase: DeleteNotificationsUseCase
  ) {}

  async getNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const limit = parseInt(req.query.limit as string) || 10;
      const offset = parseInt(req.query.offset as string) || 0;

      const notifications = await this.getNotificationsUseCase.execute(userId, limit, offset);
      res.status(StatusCode.OK).json(notifications);
    } catch (error) {
      console.error("Get Notifications Error:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  async getUnreadCount(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const count = await this.getUnreadCountUseCase.execute(userId);
      res.status(StatusCode.OK).json({ count });
    } catch (error) {
      console.error("Get Unread Count Error:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  async markAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      const id = req.params.id as string | undefined;

      await this.markAsReadUseCase.execute(userId, id);
      res.status(StatusCode.OK).json({ success: true });
    } catch (error) {
      console.error("Mark As Read Error:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  async markAllAsRead(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      await this.markAsReadUseCase.execute(userId);
      res.status(StatusCode.OK).json({ success: true });
    } catch (error) {
      console.error("Mark All As Read Error:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }

  async clearNotifications(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      if (!userId) {
        res.status(StatusCode.UNAUTHORIZED).json({ message: "Unauthorized" });
        return;
      }

      await this.deleteNotificationsUseCase.execute(userId);
      res.status(StatusCode.OK).json({ success: true });
    } catch (error) {
      console.error("Clear Notifications Error:", error);
      res.status(StatusCode.INTERNAL_SERVER_ERROR).json({ message: "Internal Server Error" });
    }
  }
}
