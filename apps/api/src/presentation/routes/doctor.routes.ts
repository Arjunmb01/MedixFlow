import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const profileController = container.doctorProfileController;
const appointmentController = container.doctorAppointmentController;
const clinicalController = container.doctorClinicalController;
const consultationController = container.consultationController;
const slotController = container.doctorSlotController;
const auth = container.authMiddleware;

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

// Consultation routes (must be before /:doctorId wildcard)
router.get("/consultations/queue", consultationController.getQueue);
router.get("/consultations/patient-history", consultationController.getPatientHistory);
router.patch("/consultations/:id/start", consultationController.start);
router.patch("/consultations/:id/complete", consultationController.complete);
router.get("/consultations/:id", consultationController.getDetails);
router.post("/consultations/:id/lab-tests", consultationController.requestLabTest);
router.get("/consultations/:id/lab-tests", consultationController.getLabTests);
router.patch("/consultations/:id/lab-tests/:labTestId/review", consultationController.reviewLabTest);

// New Workspace Routes
router.post("/consultations/:id/draft", consultationController.saveDraft);
router.get("/consultations/:id/draft", consultationController.getDraft);
router.post("/consultations/:id/follow-up", consultationController.createFollowUp);
router.post("/consultations/follow-ups/schedule", consultationController.scheduleFollowUp);
router.get("/consultations/:id/pdf", consultationController.generatePDF);

router.get("/patients", clinicalController.getConsultedPatients);
router.get("/prescriptions", clinicalController.getDoctorPrescriptions);
router.patch("/prescriptions/:id", clinicalController.updatePrescription);

router.get("/:doctorId/slots", slotController.getSlots.bind(slotController));

export default router;


