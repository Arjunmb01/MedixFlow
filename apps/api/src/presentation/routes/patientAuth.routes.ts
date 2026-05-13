import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.patientAuthController;
const auth = container.authMiddleware;

router.post("/register", controller.signUp);
router.post("/verify-otp", controller.verifyOtp);
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/resend-otp", controller.resendOtp);
router.post("/google-login", controller.googleLogin);
router.post("/logout", auth.authenticatePatient, controller.logout);
router.post("/forgot-password", controller.forgotPassword);
router.post("/reset-password", controller.resetPassword);

export default router;

