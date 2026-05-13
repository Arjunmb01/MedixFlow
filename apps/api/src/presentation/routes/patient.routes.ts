import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const profileController = container.patientProfileController;
const appointmentController = container.patientAppointmentController;
const consultationController = container.consultationController;
const auth = container.authMiddleware;

// Profile routes
router.get("/profile", auth.authenticatePatient, profileController.getPatientProfile);
router.put("/profile", auth.authenticatePatient, profileController.updatePatientProfile);
router.put("/emergency-contacts", auth.authenticatePatient, profileController.updateEmergencyContacts);
router.put("/update-password", auth.authenticatePatient, profileController.updatePassword);

// Dashboard/Appointment routes
router.get("/appointments/upcoming", auth.authenticatePatient, appointmentController.getUpcomingAppointments);
router.get("/appointments", auth.authenticatePatient, appointmentController.getPatientAppointments);
router.patch("/appointments/:id/cancel", auth.authenticatePatient, appointmentController.cancelAppointment);
router.patch("/appointments/:id/reschedule", auth.authenticatePatient, appointmentController.rescheduleAppointment);
router.post("/proposals/:proposalId/respond", auth.authenticatePatient, appointmentController.respondToProposal);
router.post("/appointments/:appointmentId/checkin", auth.authenticatePatient, consultationController.checkin);
router.get("/dashboard-stats", auth.authenticatePatient, appointmentController.getPatientDashboardStats);

// Consultation extra routes
router.post("/consultations/:id/lab-tests/:labTestId/upload", auth.authenticatePatient, consultationController.uploadLabTest);
router.get("/consultations/:id/lab-tests", auth.authenticatePatient, consultationController.getLabTests);
router.get("/consultations/:id/pdf", auth.authenticatePatient, consultationController.generatePDF);

// Admin routes for patient management
const adminController = container.adminPatientController;
router.get("/all", auth.authenticateAdmin, adminController.getAllPatients);
router.get("/stats", auth.authenticateAdmin, adminController.getPatientStats);
router.get("/:id", auth.authenticateAdmin, adminController.getPatientById);
router.put("/:id/block", auth.authenticateAdmin, adminController.blockPatient);
router.delete("/:id", auth.authenticateAdmin, adminController.deletePatient);

export default router;

