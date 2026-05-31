import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createPatientRoutes(): Router {
  const {
    patientProfileController: profileController,
    patientAppointmentController: appointmentController,
    consultationController,
    videoConsultationController: videoController,
    adminPatientController: adminController,
    authMiddleware: auth,
  } = getContainer();

  const router = Router();

  router.get("/profile", auth.authenticatePatient, profileController.getPatientProfile);
  router.put("/profile", auth.authenticatePatient, profileController.updatePatientProfile);
  router.put("/emergency-contacts", auth.authenticatePatient, profileController.updateEmergencyContacts);
  router.put("/update-password", auth.authenticatePatient, profileController.updatePassword);

  router.get("/appointments/upcoming", auth.authenticatePatient, appointmentController.getUpcomingAppointments);
  router.get("/appointments", auth.authenticatePatient, appointmentController.getPatientAppointments);
  router.patch("/appointments/:id/cancel", auth.authenticatePatient, appointmentController.cancelAppointment);
  router.patch("/appointments/:id/reschedule", auth.authenticatePatient, appointmentController.rescheduleAppointment);
  router.post("/proposals/:proposalId/respond", auth.authenticatePatient, appointmentController.respondToProposal);
  router.post("/appointments/:appointmentId/checkin", auth.authenticatePatient, consultationController.checkin);
  router.get("/dashboard-stats", auth.authenticatePatient, appointmentController.getPatientDashboardStats);

  router.post(
    "/consultations/:id/lab-tests/:labTestId/upload",
    auth.authenticatePatient,
    consultationController.uploadLabTest
  );
  router.get("/consultations/:id/lab-tests", auth.authenticatePatient, consultationController.getLabTests);
  router.get("/consultations/:id/pdf", auth.authenticatePatient, consultationController.generatePDF);

  router.post(
    "/video/appointments/:appointmentId/join-waiting-room",
    auth.authenticatePatient,
    videoController.patientJoinWaitingRoom
  );
  router.get("/video/session-state", auth.authenticatePatient, videoController.getState);
  router.post("/video/sessions/:sessionId/chat", auth.authenticatePatient, videoController.sendChatMessage);

  router.get("/all", auth.authenticateAdmin, adminController.getAllPatients);
  router.get("/stats", auth.authenticateAdmin, adminController.getPatientStats);
  router.get("/:id", auth.authenticateAdmin, adminController.getPatientById);
  router.put("/:id/block", auth.authenticateAdmin, adminController.blockPatient);
  router.delete("/:id", auth.authenticateAdmin, adminController.deletePatient);

  return router;
}
