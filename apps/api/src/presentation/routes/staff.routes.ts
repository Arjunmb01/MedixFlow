import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createStaffRoutes(): Router {
  const { staffController: controller, authMiddleware: auth } = getContainer();
  const router = Router();

<<<<<<< HEAD
  router.post("/setup-password", controller.setupPassword);
  router.use(auth.authenticateAdmin);
  router.get("/doctors", controller.getDoctors);
  router.post("/doctors", controller.createDoctor);
  router.put("/doctors/:id", controller.updateDoctor);
  router.put("/doctors/:id/block", controller.blockDoctor);
  router.delete("/doctors/:id", controller.deleteDoctor);
=======
// Public route for password setup
router.post("/setup-password", controller.setupPassword);

// Protected routes
router.use(auth.authenticateAdmin);

router.get("/doctors", controller.getDoctors);
router.post("/doctors", controller.createDoctor);
router.put("/doctors/:id", controller.updateDoctor);
router.put("/doctors/:id/block", controller.blockDoctor);
router.delete("/doctors/:id", controller.deleteDoctor);

export default router;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

  return router;
}
