import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const profileController = container.patientProfileController;
const appointmentController = container.patientAppointmentController;
const consultationController = container.consultationController;
const authMiddleware = container.authMiddleware;

// All patient routes require authentication and PATIENT role
router.use(authMiddleware);

// Profile routes
router.get("/profile", authorize(["PATIENT"]), profileController.getPatientProfile);
router.put("/profile", authorize(["PATIENT"]), profileController.updatePatientProfile);
router.put("/emergency-contacts", authorize(["PATIENT"]), profileController.updateEmergencyContacts);
router.put("/update-password", authorize(["PATIENT"]), profileController.updatePassword);

// Dashboard/Appointment routes
router.get("/appointments/upcoming", authorize(["PATIENT"]), appointmentController.getUpcomingAppointments);
router.get("/appointments", authorize(["PATIENT"]), appointmentController.getPatientAppointments);
router.patch("/appointments/:id/cancel", authorize(["PATIENT"]), appointmentController.cancelAppointment);
router.post("/appointments/:appointmentId/checkin", authorize(["PATIENT"]), consultationController.checkin);
router.get("/dashboard-stats", authorize(["PATIENT"]), appointmentController.getPatientDashboardStats);

// Admin routes for patient management (Note: These might be better in admin.routes.ts)
const adminController = container.adminPatientController;
router.get("/all", authorize(["ADMIN"]), adminController.getAllPatients);
router.get("/stats", authorize(["ADMIN"]), adminController.getPatientStats);
router.get("/:id", authorize(["ADMIN"]), adminController.getPatientById);
router.put("/:id/block", authorize(["ADMIN"]), adminController.blockPatient);
router.delete("/:id", authorize(["ADMIN"]), adminController.deletePatient);

export default router;

