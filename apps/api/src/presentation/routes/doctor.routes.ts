import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { container } from "@/infrastructure/services/container/CompositionRoot";



const router = Router();
const controller = container.doctorController;
const consultationController = container.consultationController;
const slotController = container.doctorSlotController;
const authMiddleware = container.authMiddleware;

router.use(authMiddleware);
router.use(authorize(["DOCTOR"]));

router.get("/profile", controller.getDoctorProfile);
router.put("/profile", controller.updateDoctorProfile);
router.put("/update-password", controller.updateDoctorPassword);
router.get("/dashboard-stats", controller.getDoctorDashboardStats);
router.get("/appointments", controller.getDoctorAppointments);
router.put("/schedules", controller.updateDoctorSchedules);

// Consultation routes (must be before /:doctorId wildcard)
router.get("/consultations/queue", consultationController.getQueue);
router.get("/consultations/patient-history", consultationController.getPatientHistory);
router.patch("/consultations/:id/start", consultationController.start);
router.patch("/consultations/:id/complete", consultationController.complete);
router.get("/consultations/:id", consultationController.getDetails);

router.get("/patients", controller.getConsultedPatients);
router.get("/prescriptions", controller.getDoctorPrescriptions);
router.patch("/prescriptions/:id", controller.updatePrescription);

router.get("/:doctorId/slots",slotController.getSlots.bind(controller));

export default router;


