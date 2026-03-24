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
const repo = new AppointmentRepository(prisma);

const getSlotsUseCase = new GetAvailableSlotsUseCase(repo);
const slotCOntroller = new DoctorSlotController(getSlotsUseCase);

router.use(authMiddleware);
router.use(authorize(["DOCTOR"]));

router.get("/profile", controller.getDoctorProfile);
router.put("/profile", controller.updateDoctorProfile);
router.put("/update-password", controller.updateDoctorPassword);
router.get("/dashboard-stats", controller.getDoctorDashboardStats);
router.get("/appointments", controller.getDoctorAppointments);
router.get("/notifications", controller.getNotifications);
router.put("/schedules", controller.updateDoctorSchedules);
router.get("/:doctorId/slots",slotCOntroller.getSlots.bind(controller))

export default router;
