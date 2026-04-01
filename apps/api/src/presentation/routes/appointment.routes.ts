import { Router } from "express";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.appointmentController;
const slotController = container.doctorSlotController;

router.get("/slots", slotController.getSlots.bind(slotController));

router.post("/", controller.book.bind(controller));

export default router;
