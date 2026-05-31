import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createAdminAuthRoutes(): Router {
  const { adminAuthController: controller, authMiddleware: auth } = getContainer();
  const router = Router();

  router.post("/login", controller.login);
  router.post("/refresh-token", controller.refreshToken);
  router.post("/logout", auth.authenticateAdmin, controller.logout);

  return router;
}
