import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { container } from "@/infrastructure/services/container/CompositionRoot";



const router = Router();
const profileController = container.doctorProfileController;
const appointmentController = container.doctorAppointmentController;
const clinicalController = container.doctorClinicalController;
const consultationController = container.consultationController;
const slotController = container.doctorSlotController;
const authMiddleware = container.authMiddleware;

router.use(authMiddleware);
router.use(authorize(["DOCTOR"]));

router.get("/profile", profileController.getDoctorProfile);
router.put("/profile", profileController.updateDoctorProfile);
router.put("/update-password", profileController.updateDoctorPassword);
router.get("/dashboard-stats", appointmentController.getDoctorDashboardStats);
router.get("/appointments", appointmentController.getDoctorAppointments);
router.put("/schedules", appointmentController.updateDoctorSchedules);

// Consultation routes (must be before /:doctorId wildcard)
router.get("/consultations/queue", consultationController.getQueue);
router.get("/consultations/patient-history", consultationController.getPatientHistory);
router.patch("/consultations/:id/start", consultationController.start);
router.patch("/consultations/:id/complete", consultationController.complete);
router.get("/consultations/:id", consultationController.getDetails);

router.get("/patients", clinicalController.getConsultedPatients);
router.get("/prescriptions", clinicalController.getDoctorPrescriptions);
router.patch("/prescriptions/:id", clinicalController.updatePrescription);

router.get("/:doctorId/slots", slotController.getSlots.bind(slotController));

export default router;


