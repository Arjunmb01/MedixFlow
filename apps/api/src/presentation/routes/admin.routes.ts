import { Router } from "express";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { container } from "@/infrastructure/services/container/CompositionRoot";

const router = Router();
const adminController = container.adminPatientController;
const paymentController = container.paymentController;
const auth = container.authMiddleware;

router.use(auth.authenticate, auth.authorize([UserRole.ADMIN]));

router.get("/patients", adminController.getAllPatients);
router.get("/patients/:id", adminController.getPatientById);
router.put("/patients/:id/status", adminController.blockPatient);
router.delete("/patients/:id", adminController.deletePatient);
router.get("/stats", adminController.getPatientStats);
router.get("/appointments", adminController.getAllAppointments);
router.get("/payments", paymentController.getAllPayments.bind(paymentController));
router.patch("/appointments/:id/reschedule", adminController.rescheduleAppointment);

export default router;
