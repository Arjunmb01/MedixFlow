import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createDoctorAuthRoutes(): Router {
  const { doctorAuthController: controller, authMiddleware: auth } = getContainer();
  const router = Router();

  router.post("/login", controller.login);
  router.post("/refresh-token", controller.refreshToken);
  router.post("/logout", auth.authenticateDoctor, controller.logout);
  router.post("/forgot-password", controller.forgotPassword);
  router.post("/reset-password", controller.resetPassword);

  return router;
}
