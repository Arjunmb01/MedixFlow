import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.patientController;
const consultationController = container.consultationController;
const authMiddleware = container.authMiddleware;

// All patient routes require authentication and PATIENT role
router.use(authMiddleware);

// Profile routes
router.get("/profile", authorize(["PATIENT"]), controller.getPatientProfile);
router.put("/profile", authorize(["PATIENT"]), controller.updatePatientProfile);
router.put("/emergency-contacts", authorize(["PATIENT"]), controller.updateEmergencyContacts);
router.put("/update-password", authorize(["PATIENT"]), controller.updatePassword);

// Dashboard routes
router.get("/appointments/upcoming", authorize(["PATIENT"]), controller.getUpcomingAppointments);
router.get("/appointments/upcoming", authorize(["PATIENT"]), controller.getUpcomingAppointments);
router.get("/appointments", authorize(["PATIENT"]), controller.getPatientAppointments);
router.patch("/appointments/:id/cancel", authorize(["PATIENT"]), controller.cancelAppointment);
router.post("/appointments/:appointmentId/checkin", authorize(["PATIENT"]), consultationController.checkin);
router.get("/dashboard-stats", authorize(["PATIENT"]), controller.getPatientDashboardStats);

// Admin routes for patient management
router.get("/all", authorize(["ADMIN"]), controller.getAllPatients);
router.get("/stats", authorize(["ADMIN"]), controller.getPatientStats); // Updated from getDashboardStats to getPatientStats
router.get("/:id", authorize(["ADMIN"]), controller.getPatientById);
router.put("/:id/block", authorize(["ADMIN"]), controller.blockPatient);
router.delete("/:id", authorize(["ADMIN"]), controller.deletePatient);

export default router;

