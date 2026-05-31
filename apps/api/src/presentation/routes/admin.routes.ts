import { Router } from "express";
import { getContainer } from "@/infrastructure/services/container/CompositionRoot";

export default function createAdminRoutes(): Router {
  const {
    adminPatientController: adminController,
    paymentController,
    authMiddleware: auth,
  } = getContainer();

  const router = Router();
  router.use(auth.authenticateAdmin);

  router.get("/patients", adminController.getAllPatients);
  router.get("/patients/:id", adminController.getPatientById);
  router.put("/patients/:id/status", adminController.blockPatient);
  router.delete("/patients/:id", adminController.deletePatient);
  router.get("/stats", adminController.getPatientStats);
  router.get("/appointments", adminController.getAllAppointments);
  router.get("/payments", paymentController.getAllPayments.bind(paymentController));
  router.patch("/appointments/:id/reschedule", adminController.rescheduleAppointment);

  return router;
}
