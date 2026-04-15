import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.adminAuthController;
const authMiddleware = container.authMiddleware;

router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", authMiddleware, authorize([UserRole.ADMIN]), controller.logout);

export default router;

