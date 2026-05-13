import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const controller = container.appointmentController;
const slotController = container.doctorSlotController;

const auth = container.authMiddleware;

router.get("/slots", slotController.getSlots.bind(slotController));
router.get("/check-conflict", auth.authenticateRoles([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]), controller.checkConflict.bind(controller));

router.post("/", auth.authenticatePatient, controller.book.bind(controller));
router.get("/:id", auth.authenticateRoles([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]), controller.getById.bind(controller));
router.patch("/:id/status", auth.authenticateRoles([UserRole.DOCTOR, UserRole.ADMIN]), controller.updateStatus.bind(controller));

export default router;
