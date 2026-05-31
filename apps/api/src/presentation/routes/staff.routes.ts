import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createStaffRoutes(): Router {
  const { staffController: controller, authMiddleware: auth } = getContainer();
  const router = Router();

  router.post("/setup-password", controller.setupPassword);
  router.use(auth.authenticateAdmin);
  router.get("/doctors", controller.getDoctors);
  router.post("/doctors", controller.createDoctor);
  router.put("/doctors/:id", controller.updateDoctor);
  router.put("/doctors/:id/block", controller.blockDoctor);
  router.delete("/doctors/:id", controller.deleteDoctor);

  return router;
}
