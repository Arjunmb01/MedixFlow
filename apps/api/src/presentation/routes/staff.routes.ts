import { Router } from "express";
import { authMiddleware } from "@/presentation/middleware/auth.middleware";
import { authorize } from "@/presentation/middleware/authorize.middleware";
import { container } from "@/infrastructure/container/AppContainer";

const router = Router();
const controller = container.staffController;

// Public route for password setup
router.post("/setup-password", controller.setupPassword);

// Protected routes
router.use(authMiddleware);
router.use(authorize(["ADMIN"]));

router.get("/doctors", controller.getDoctors);
router.post("/doctors", controller.createDoctor);
router.put("/doctors/:id", controller.updateDoctor);
router.put("/doctors/:id/block", controller.blockDoctor);
router.delete("/doctors/:id", controller.deleteDoctor);

export default router;
