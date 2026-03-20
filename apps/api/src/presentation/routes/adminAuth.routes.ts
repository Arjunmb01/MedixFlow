import { Router } from "express";
import { authMiddleware } from "@/presentation/middleware/auth.middleware";
import { authorize } from "@/presentation/middleware/authorize.middleware";
import { container } from "@/infrastructure/container/AppContainer";

const router = Router();
const controller = container.adminAuthController;

router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", authMiddleware, authorize(["ADMIN"]), controller.logout);

export default router;
