import { Router } from "express";
import { authorize } from "@/presentation/middleware/authorize.middleware";
import { authMiddleware } from "@/presentation/middleware/auth.middleware";
import { container } from "@/infrastructure/container/AppContainer";

const router = Router();
const controller = container.patientController;

// All patient routes require authentication and PATIENT role
router.use(authMiddleware);

// Profile routes
router.get("/profile", authorize(["PATIENT"]), controller.getPatientProfile);
router.put("/profile", authorize(["PATIENT"]), controller.updatePatientProfile);
router.put("/emergency-contacts", authorize(["PATIENT"]), controller.updateEmergencyContacts);
router.put("/update-password", authorize(["PATIENT"]), controller.updatePassword);

// Admin routes for patient management
router.get("/all", authorize(["ADMIN"]), controller.getAllPatients);
router.get("/stats", authorize(["ADMIN"]), controller.getDashboardStats);
router.get("/:id", authorize(["ADMIN"]), controller.getPatientById);
router.put("/:id/block", authorize(["ADMIN"]), controller.blockPatient);
router.delete("/:id", authorize(["ADMIN"]), controller.deletePatient);

export default router;
