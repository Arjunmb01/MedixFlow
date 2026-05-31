import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createAppointmentRoutes(): Router {
  const {
    appointmentController: controller,
    doctorSlotController: slotController,
    authMiddleware: auth,
  } = getContainer();

  const router = Router();

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
