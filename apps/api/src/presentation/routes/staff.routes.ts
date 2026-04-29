import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.staffController;
const auth = container.authMiddleware;

// Public route for password setup
router.post("/setup-password", controller.setupPassword);

// Protected routes
router.use(auth.authenticate, auth.authorize([UserRole.ADMIN]));

router.get("/doctors", controller.getDoctors);
router.post("/doctors", controller.createDoctor);
router.put("/doctors/:id", controller.updateDoctor);
router.put("/doctors/:id/block", controller.blockDoctor);
router.delete("/doctors/:id", controller.deleteDoctor);

export default router;

