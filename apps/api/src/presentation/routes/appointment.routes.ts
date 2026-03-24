import { Router } from "express";
import { AppointmentController } from "../controllers/AppointmentController";
import { DoctorSlotController } from "../controllers/DoctorSlotController";
import { GetAvailableSlotsUseCase } from "@/application/usecases/appointment/getAvailableSlots.usecase";
import { BookAppointmentUseCase } from "@/application/usecases/appointment/bookAppointment.usecase";
import { AppointmentRepository } from "@/infrastructure/repositories/AppointmentRepository";
import { NotificationRepository } from "@/infrastructure/repositories/NotificationRepository";
import { prisma } from "@/infrastructure/database/prismaClient";

const router = Router();

const appointmentRepo = new AppointmentRepository(prisma);
const getSlotsUseCase = new GetAvailableSlotsUseCase(appointmentRepo);
const notificationRepo = new NotificationRepository(prisma)
const bookUseCase = new BookAppointmentUseCase(appointmentRepo,notificationRepo);


const controller = new AppointmentController(getSlotsUseCase, bookUseCase);
const slotController = new DoctorSlotController(getSlotsUseCase);

router.get("/slots", slotController.getSlots.bind(slotController));

router.post("/", controller.book.bind(controller));

export default router;