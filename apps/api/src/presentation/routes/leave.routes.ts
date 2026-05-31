import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export function createLeaveRouters(): {
  doctorLeaveRouter: Router;
  adminLeaveRouter: Router;
} {
  const { leaveController, authMiddleware: auth } = getContainer();

<<<<<<< HEAD
  const doctorLeaveRouter = Router();
  doctorLeaveRouter.use(auth.authenticateDoctor);
  doctorLeaveRouter.post("/", leaveController.applyLeave);
  doctorLeaveRouter.get("/", leaveController.getMyLeaves);
  doctorLeaveRouter.delete("/:id", leaveController.cancelLeave);

  const adminLeaveRouter = Router();
  adminLeaveRouter.use(auth.authenticateAdmin);
  adminLeaveRouter.get("/", leaveController.getAllLeaves);
  adminLeaveRouter.patch("/:id/review", leaveController.reviewLeave);
=======
// Doctor leave routes
const doctorRouter = Router();
doctorRouter.use(auth.authenticateDoctor);
doctorRouter.post("/", leaveController.applyLeave);
doctorRouter.get("/", leaveController.getMyLeaves);
doctorRouter.delete("/:id", leaveController.cancelLeave);

// Admin/Staff leave routes
const adminRouter = Router();
adminRouter.use(auth.authenticateAdmin);
adminRouter.get("/", leaveController.getAllLeaves);
adminRouter.patch("/:id/review", leaveController.reviewLeave);
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

  return { doctorLeaveRouter, adminLeaveRouter };
}
