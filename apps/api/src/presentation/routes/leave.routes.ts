import { Router } from "express";
import { authorize } from "@/presentation/controllers/middleware/authorize.middleware";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const leaveController = container.leaveController;
const authMiddleware = container.authMiddleware;

// Doctor leave routes
const doctorRouter = Router();
doctorRouter.use(authMiddleware);
doctorRouter.use(authorize([UserRole.DOCTOR]));
doctorRouter.post("/", leaveController.applyLeave);
doctorRouter.get("/", leaveController.getMyLeaves);
doctorRouter.delete("/:id", leaveController.cancelLeave);

// Admin/Staff leave routes
const adminRouter = Router();
adminRouter.use(authMiddleware);
adminRouter.use(authorize([UserRole.ADMIN]));
adminRouter.get("/", leaveController.getAllLeaves);
adminRouter.patch("/:id/review", leaveController.reviewLeave);

export { doctorRouter as doctorLeaveRouter, adminRouter as adminLeaveRouter };
