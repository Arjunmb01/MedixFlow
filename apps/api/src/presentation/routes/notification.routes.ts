import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createNotificationRoutes(): Router {
  const { notificationController: controller, authMiddleware: auth } = getContainer();
  const router = Router();

  router.use(auth.authenticate);
  router.get("/", (req, res) => controller.getNotifications(req, res));
  router.get("/unread-count", (req, res) => controller.getUnreadCount(req, res));
  router.post("/mark-read", (req, res) => controller.markAllAsRead(req, res));
  router.post("/mark-read/:id", (req, res) => controller.markAsRead(req, res));
  router.delete("/", (req, res) => controller.clearNotifications(req, res));

  return router;
}
