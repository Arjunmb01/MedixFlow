import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createDoctorRoutes(): Router {
  const {
    doctorProfileController: profileController,
    doctorAppointmentController: appointmentController,
    doctorClinicalController: clinicalController,
    consultationController,
    videoConsultationController: videoController,
    doctorSlotController: slotController,
    authMiddleware: auth,
  } = getContainer();

  const router = Router();
  router.use(auth.authenticateDoctor);

  router.get("/profile", profileController.getDoctorProfile);
  router.put("/profile", profileController.updateDoctorProfile);
  router.put("/update-password", profileController.updateDoctorPassword);
  router.get("/dashboard-stats", appointmentController.getDoctorDashboardStats);
  router.get("/appointments", appointmentController.getDoctorAppointments);
  router.patch("/appointments/:id/reschedule", appointmentController.rescheduleAppointment);
  router.post("/appointments/:id/reassign", appointmentController.reassignAppointment);
  router.post("/leave/process", appointmentController.processLeave);
  router.put("/schedules", appointmentController.updateDoctorSchedules);

  router.get("/consultations/queue", consultationController.getQueue);
  router.get("/consultations/patient-history", consultationController.getPatientHistory);
  router.patch("/consultations/:id/start", consultationController.start);
  router.patch("/consultations/:id/complete", consultationController.complete);
  router.get("/consultations/:id", consultationController.getDetails);
  router.post("/consultations/:id/lab-tests", consultationController.requestLabTest);
  router.get("/consultations/:id/lab-tests", consultationController.getLabTests);

  router.post("/video/appointments/:appointmentId/start", videoController.doctorStart);
  router.post("/video/sessions/:sessionId/admit", videoController.doctorAdmit);
  router.post("/video/sessions/:sessionId/end", videoController.end);
  router.get("/video/session-state", videoController.getState);
  router.post("/video/sessions/:sessionId/chat", videoController.sendChatMessage);

  router.get("/patients", clinicalController.getConsultedPatients);
  router.get("/prescriptions", clinicalController.getDoctorPrescriptions);
  router.patch("/prescriptions/:id", clinicalController.updatePrescription);

  router.get("/:doctorId/slots", slotController.getSlots.bind(slotController));

  return router;
}
