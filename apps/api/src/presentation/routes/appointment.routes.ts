import { Router } from "express";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.appointmentController;
const slotController = container.doctorSlotController;

const auth = container.authMiddleware;

router.get("/slots", slotController.getSlots.bind(slotController));
router.get("/check-conflict", auth.authenticate, controller.checkConflict.bind(controller));

router.post("/", auth.authenticate, controller.book.bind(controller));
router.get("/:id", auth.authenticate, controller.getById.bind(controller));
router.patch("/:id/status", auth.authenticate, auth.authorize(["DOCTOR", "ADMIN", "STAFF"]), controller.updateStatus.bind(controller));

export default router;
