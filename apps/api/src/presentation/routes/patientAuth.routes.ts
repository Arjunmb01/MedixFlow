import { Router } from "express";
import { authMiddleware } from "@/presentation/middleware/auth.middleware";
import { authorize } from "@/presentation/middleware/authorize.middleware";
import { container } from "@/infrastructure/container/AppContainer";

const router = Router();
const controller = container.patientAuthController;

router.post("/register", controller.signUp);
router.post("/verify-otp", controller.verifyOtp);
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/resend-otp", controller.resendOtp);
router.post("/google-login", controller.googleLogin);
router.post("/logout", authMiddleware, authorize(["PATIENT"]), controller.logout);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

export default router;
