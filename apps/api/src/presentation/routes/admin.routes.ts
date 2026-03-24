import { Router } from "express";
import { authMiddleware } from "@/presentation/middleware/auth.middleware";
import { authorize } from "@/presentation/middleware/authorize.middleware";
import { container } from "@/infrastructure/container/AppContainer";

const router = Router();
const patientController = container.patientController;

router.use(authMiddleware, authorize(["ADMIN"]));

router.get("/patients", patientController.getAllPatients);
router.get("/patients/:id", patientController.getPatientById);
router.put("/patients/:id/status", patientController.blockPatient);
router.delete("/patients/:id", patientController.deletePatient);
router.get("/stats", patientController.getPatientStats);
router.get("/appointments", patientController.getAllAppointments.bind(patientController));

export default router;
