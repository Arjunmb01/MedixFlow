import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.adminAuthController;
const auth = container.authMiddleware;

router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", auth.authenticate, auth.authorize([UserRole.ADMIN]), controller.logout);

export default router;

