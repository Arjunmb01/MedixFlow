import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createPatientAuthRoutes(): Router {
  const { patientAuthController: controller, authMiddleware: auth } = getContainer();
  const router = Router();

  router.post("/register", controller.signUp);
  router.post("/verify-otp", controller.verifyOtp);
  router.post("/login", controller.login);
  router.post("/refresh-token", controller.refreshToken);
  router.post("/resend-otp", controller.resendOtp);
  router.post("/google-login", controller.googleLogin);
  router.post("/logout", auth.authenticatePatient, controller.logout);
  router.post("/forgot-password", controller.forgotPassword);
  router.post("/reset-password", controller.resetPassword);

  return router;
}
