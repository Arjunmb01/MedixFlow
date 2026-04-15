import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { SlotController } from "../controllers/SlotController";
import { container } from "@/infrastructure/services/container/CompositionRoot";

export const createSlotRoutes = (controller: SlotController) => {
    const router = Router();
    const authMiddleware = container.authMiddleware;

    router.use(authMiddleware);

    router.post("/generate", authorize([UserRole.DOCTOR, UserRole.ADMIN]), controller.generate);
    router.get("/available", authorize([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]), controller.getAvailableSlots);
    router.post("/book", authorize([UserRole.PATIENT]), controller.bookSlot);

    return router;
};

