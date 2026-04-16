import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const adminController = container.adminPatientController;
const authMiddleware = container.authMiddleware;

router.use(authMiddleware, authorize([UserRole.ADMIN]));

router.get("/patients", adminController.getAllPatients);
router.get("/patients/:id", adminController.getPatientById);
router.put("/patients/:id/status", adminController.blockPatient);
router.delete("/patients/:id", adminController.deletePatient);
router.get("/stats", adminController.getPatientStats);
router.get("/appointments", adminController.getAllAppointments);
router.patch("/appointments/:id/reschedule", adminController.rescheduleAppointment);

export default router;
