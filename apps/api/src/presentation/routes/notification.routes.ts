import { Router } from "express";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.notificationController;
const authMiddleware = container.authMiddleware;

router.use(authMiddleware);

router.get("/", (req, res) => controller.getNotifications(req, res));
router.get("/unread-count", (req, res) => controller.getUnreadCount(req, res));
router.post("/mark-read", (req, res) => controller.markAllAsRead(req, res));
router.post("/mark-read/:id", (req, res) => controller.markAsRead(req, res));
router.delete("/", (req, res) => controller.clearNotifications(req, res));

export default router;
