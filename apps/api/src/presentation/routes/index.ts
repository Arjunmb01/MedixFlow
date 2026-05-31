import { Router } from "express";
import createPatientAuthRoutes from "./patientAuth.routes";
import createAdminAuthRoutes from "./adminAuth.routes";
import createDoctorAuthRoutes from "./doctorAuth.routes";
import createPatientRoutes from "./patient.routes";
import createStaffRoutes from "./staff.routes";
import createDoctorRoutes from "./doctor.routes";
import createAdminRoutes from "./admin.routes";
import createPublicDoctorRoutes from "./publicDoctor.routes";
import createUploadRoutes from "./upload.routes";
import createAppointmentRoutes from "./appointment.routes";
import { createLeaveRouters } from "./leave.routes";
import createNotificationRoutes from "./notification.routes";
import createPaymentRoutes from "./payment.routes";
import createWalletRoutes from "./wallet.routes";

export default function createApiRouter(): Router {
  const router = Router();
  const { doctorLeaveRouter, adminLeaveRouter } = createLeaveRouters();

  router.use("/common", createUploadRoutes());
  router.use("/auth", createPatientAuthRoutes());
  router.use("/admin/auth", createAdminAuthRoutes());
  router.use("/doctor/auth", createDoctorAuthRoutes());
  router.use("/admin", createAdminRoutes());
  router.use("/patient/wallet", createWalletRoutes());
  router.use("/patient", createPatientRoutes());
  router.use("/staff", createStaffRoutes());
  router.use("/doctor", createDoctorRoutes());
  router.use("/doctors", createPublicDoctorRoutes());
  router.use("/appointments", createAppointmentRoutes());
  router.use("/doctor/leaves", doctorLeaveRouter);
  router.use("/admin/leaves", adminLeaveRouter);
  router.use("/notifications", createNotificationRoutes());
  router.use("/payments", createPaymentRoutes());

  return router;
}
