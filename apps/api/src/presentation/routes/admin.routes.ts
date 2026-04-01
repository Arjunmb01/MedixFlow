import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const patientController = container.patientController;
const authMiddleware = container.authMiddleware;

router.use(authMiddleware, authorize(["ADMIN"]));

router.get("/patients", patientController.getAllPatients);
router.get("/patients/:id", patientController.getPatientById);
router.put("/patients/:id/status", patientController.blockPatient);
router.delete("/patients/:id", patientController.deletePatient);
router.get("/stats", patientController.getPatientStats);
router.get("/appointments", patientController.getAllAppointments.bind(patientController));

export default router;

