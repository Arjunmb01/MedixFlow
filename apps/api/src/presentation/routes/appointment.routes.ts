import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
<<<<<<< HEAD
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";
=======
import { container } from "@/infrastructure/services/container/CompositionRoot";
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909

export default function createAppointmentRoutes(): Router {
  const {
    appointmentController: controller,
    doctorSlotController: slotController,
    authMiddleware: auth,
  } = getContainer();

  const router = Router();

<<<<<<< HEAD
  router.get("/slots", slotController.getSlots.bind(slotController));
  router.get(
    "/check-conflict",
    auth.authenticateRoles([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]),
    controller.checkConflict.bind(controller)
  );
  router.post("/", auth.authenticatePatient, controller.book.bind(controller));
  router.get(
    "/:id",
    auth.authenticateRoles([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]),
    controller.getById.bind(controller)
  );
  router.patch(
    "/:id/status",
    auth.authenticateRoles([UserRole.DOCTOR, UserRole.ADMIN]),
    controller.updateStatus.bind(controller)
  );

  return router;
}
=======
router.get("/slots", slotController.getSlots.bind(slotController));
router.get("/check-conflict", auth.authenticateRoles([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]), controller.checkConflict.bind(controller));

router.post("/", auth.authenticatePatient, controller.book.bind(controller));
router.get("/:id", auth.authenticateRoles([UserRole.PATIENT, UserRole.DOCTOR, UserRole.ADMIN]), controller.getById.bind(controller));
router.patch("/:id/status", auth.authenticateRoles([UserRole.DOCTOR, UserRole.ADMIN]), controller.updateStatus.bind(controller));

export default router;
>>>>>>> 141ec674faa5e8dec8f62adfdfa63bd47aaf7909
