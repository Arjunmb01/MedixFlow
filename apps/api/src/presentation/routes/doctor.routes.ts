import { Router } from "express";
import { prisma } from "@/infrastructure/database/prismaClient";
import { authMiddleware } from "@/presentation/middleware/auth.middleware";
import { authorize } from "@/presentation/middleware/authorize.middleware";
import { container } from "@/infrastructure/container/AppContainer";
import { AppointmentRepository } from "@/infrastructure/repositories/AppointmentRepository";
import { GetAvailableSlotsUseCase } from "@/application/usecases/appointment/getAvailableSlots.usecase";
import { DoctorSlotController } from "../controllers/DoctorSlotController";



const router = Router();
const controller = container.doctorController;
const consultationController = container.consultationController;
const repo = new AppointmentRepository(prisma);

const getSlotsUseCase = new GetAvailableSlotsUseCase(repo);
const slotController = new DoctorSlotController(getSlotsUseCase);

router.use(authMiddleware);
router.use(authorize(["DOCTOR"]));

router.get("/profile", controller.getDoctorProfile);
router.put("/profile", controller.updateDoctorProfile);
router.put("/update-password", controller.updateDoctorPassword);
router.get("/dashboard-stats", controller.getDoctorDashboardStats);
router.get("/appointments", controller.getDoctorAppointments);
router.get("/notifications", controller.getNotifications);
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
