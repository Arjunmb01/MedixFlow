import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const leaveController = container.leaveController;
const auth = container.authMiddleware;

// Doctor leave routes
const doctorRouter = Router();
doctorRouter.use(auth.authenticate, auth.authorize([UserRole.DOCTOR]));
doctorRouter.post("/", leaveController.applyLeave);
doctorRouter.get("/", leaveController.getMyLeaves);
doctorRouter.delete("/:id", leaveController.cancelLeave);

// Admin/Staff leave routes
const adminRouter = Router();
adminRouter.use(auth.authenticate, auth.authorize([UserRole.ADMIN]));
adminRouter.get("/", leaveController.getAllLeaves);
adminRouter.patch("/:id/review", leaveController.reviewLeave);

export { doctorRouter as doctorLeaveRouter, adminRouter as adminLeaveRouter };
