import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { SlotController } from "../controllers/SlotController";
import { container } from "@/infrastructure/services/container/CompositionRoot";

export const createSlotRoutes = (controller: SlotController) => {
    const router = Router();
    const authMiddleware = container.authMiddleware;

    router.use(authMiddleware);

    router.post("/generate", authorize(["DOCTOR", "ADMIN"]), controller.generate);
    router.get("/available", authorize(["PATIENT", "DOCTOR", "ADMIN"]), controller.getAvailableSlots);
    router.post("/book", authorize(["PATIENT"]), controller.bookSlot);

    return router;
};

