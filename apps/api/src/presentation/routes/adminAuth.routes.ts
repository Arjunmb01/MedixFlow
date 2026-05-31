import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createAdminAuthRoutes(): Router {
  const { adminAuthController: controller, authMiddleware: auth } = getContainer();
  const router = Router();

<<<<<<< HEAD
  router.post("/login", controller.login);
  router.post("/refresh-token", controller.refreshToken);
  router.post("/logout", auth.authenticateAdmin, controller.logout);
=======
router.post("/login", controller.login);
router.post("/refresh-token", controller.refreshToken);
router.post("/logout", auth.authenticateAdmin, controller.logout);

export default router;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

  return router;
}
