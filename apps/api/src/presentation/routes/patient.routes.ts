import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const profileController = container.patientProfileController;
const appointmentController = container.patientAppointmentController;
const consultationController = container.consultationController;
const auth = container.authMiddleware;

// All patient routes require authentication
router.use(auth.authenticate);

// Profile routes
router.get("/profile", auth.authorize([UserRole.PATIENT]), profileController.getPatientProfile);
router.put("/profile", auth.authorize([UserRole.PATIENT]), profileController.updatePatientProfile);
router.put("/emergency-contacts", auth.authorize([UserRole.PATIENT]), profileController.updateEmergencyContacts);
router.put("/update-password", auth.authorize([UserRole.PATIENT]), profileController.updatePassword);

// Dashboard/Appointment routes
router.get("/appointments/upcoming", auth.authorize([UserRole.PATIENT]), appointmentController.getUpcomingAppointments);
router.get("/appointments", auth.authorize([UserRole.PATIENT]), appointmentController.getPatientAppointments);
router.patch("/appointments/:id/cancel", auth.authorize([UserRole.PATIENT]), appointmentController.cancelAppointment);
router.patch("/appointments/:id/reschedule", auth.authorize([UserRole.PATIENT]), appointmentController.rescheduleAppointment);
router.post("/proposals/:proposalId/respond", auth.authorize([UserRole.PATIENT]), appointmentController.respondToProposal);
router.post("/appointments/:appointmentId/checkin", auth.authorize([UserRole.PATIENT]), consultationController.checkin);
router.get("/dashboard-stats", auth.authorize([UserRole.PATIENT]), appointmentController.getPatientDashboardStats);

// Consultation extra routes
router.post("/consultations/:id/lab-tests/:labTestId/upload", auth.authorize([UserRole.PATIENT]), consultationController.uploadLabTest);
router.get("/consultations/:id/lab-tests", auth.authorize([UserRole.PATIENT]), consultationController.getLabTests);

// Admin routes for patient management (Note: These might be better in admin.routes.ts)
const adminController = container.adminPatientController;
router.get("/all", auth.authorize([UserRole.ADMIN]), adminController.getAllPatients);
router.get("/stats", auth.authorize([UserRole.ADMIN]), adminController.getPatientStats);
router.get("/:id", auth.authorize([UserRole.ADMIN]), adminController.getPatientById);
router.put("//:id/block", auth.authorize([UserRole.ADMIN]), adminController.blockPatient);
router.delete("/:id", auth.authorize([UserRole.ADMIN]), adminController.deletePatient);

export default router;

