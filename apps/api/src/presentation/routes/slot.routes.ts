import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { SlotController } from "../controllers/SlotController";
import { container } from "@/infrastructure/services/container/CompositionRoot";

export const createSlotRoutes = (controller: SlotController) => {
    const router = Router();
    const auth = container.authMiddleware;

    router.use(auth.authenticate);

    router.post("/generate", auth.authorize([UserRole.DOCTOR, UserRole.ADMIN]), controller.generate);
    router.get("/available", auth.authorize([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]), controller.getAvailableSlots);
    router.post("/book", auth.authorize([UserRole.PATIENT]), controller.bookSlot);

    return router;
};

