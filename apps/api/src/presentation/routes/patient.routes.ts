import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const profileController = container.patientProfileController;
const appointmentController = container.patientAppointmentController;
const consultationController = container.consultationController;
const authMiddleware = container.authMiddleware;

// All patient routes require authentication and PATIENT role
router.use(authMiddleware);

// Profile routes
router.get("/profile", authorize([UserRole.PATIENT]), profileController.getPatientProfile);
router.put("/profile", authorize([UserRole.PATIENT]), profileController.updatePatientProfile);
router.put("/emergency-contacts", authorize([UserRole.PATIENT]), profileController.updateEmergencyContacts);
router.put("/update-password", authorize([UserRole.PATIENT]), profileController.updatePassword);

// Dashboard/Appointment routes
router.get("/appointments/upcoming", authorize([UserRole.PATIENT]), appointmentController.getUpcomingAppointments);
router.get("/appointments", authorize([UserRole.PATIENT]), appointmentController.getPatientAppointments);
router.patch("/appointments/:id/cancel", authorize([UserRole.PATIENT]), appointmentController.cancelAppointment);
router.post("/appointments/:appointmentId/checkin", authorize([UserRole.PATIENT]), consultationController.checkin);
router.get("/dashboard-stats", authorize([UserRole.PATIENT]), appointmentController.getPatientDashboardStats);

// Admin routes for patient management (Note: These might be better in admin.routes.ts)
const adminController = container.adminPatientController;
router.get("/all", authorize([UserRole.ADMIN]), adminController.getAllPatients);
router.get("/stats", authorize([UserRole.ADMIN]), adminController.getPatientStats);
router.get("/:id", authorize([UserRole.ADMIN]), adminController.getPatientById);
router.put("//:id/block", authorize([UserRole.ADMIN]), adminController.blockPatient);
router.delete("/:id", authorize([UserRole.ADMIN]), adminController.deletePatient);

export default router;

