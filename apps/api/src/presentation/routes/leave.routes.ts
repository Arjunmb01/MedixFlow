import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export function createLeaveRouters(): {
  doctorLeaveRouter: Router;
  adminLeaveRouter: Router;
} {
  const { leaveController, authMiddleware: auth } = getContainer();

  const doctorLeaveRouter = Router();
  doctorLeaveRouter.use(auth.authenticateDoctor);
  doctorLeaveRouter.post("/", leaveController.applyLeave);
  doctorLeaveRouter.get("/", leaveController.getMyLeaves);
  doctorLeaveRouter.delete("/:id", leaveController.cancelLeave);

  const adminLeaveRouter = Router();
  adminLeaveRouter.use(auth.authenticateAdmin);
  adminLeaveRouter.get("/", leaveController.getAllLeaves);
  adminLeaveRouter.patch("/:id/review", leaveController.reviewLeave);

  return { doctorLeaveRouter, adminLeaveRouter };
}
