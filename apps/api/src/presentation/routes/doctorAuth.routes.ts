import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.doctorAuthController;
const authMiddleware = container.authMiddleware;

router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", authMiddleware, authorize(["DOCTOR"]), controller.logout);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

export default router;

