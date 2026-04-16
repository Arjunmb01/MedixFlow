import { Router } from "express";
import authRoutes from ".//patientAuth.routes"
import adminAuthRoutes from ".//adminAuth.routes"
import doctorAuthRoutes from ".//doctorAuth.routes"
import patientRoutes from ".//patient.routes"
import staffRoutes from ".//staff.routes"
import doctorRoutes from ".//doctor.routes"
import sharedAdminRoutes from ".//admin.routes"
import publicDoctorRoutes from ".//publicDoctor.routes"
import uploadRoutes from ".//upload.routes"
import appointmentRoutes from ".//appointment.routes"
import { doctorLeaveRouter, adminLeaveRouter } from ".//leave.routes"

const router = Router()
router.use("/common", uploadRoutes)
router.use("/auth", authRoutes)
router.use("/admin/auth", adminAuthRoutes)
router.use("/doctor/auth", doctorAuthRoutes)
router.use("/admin", sharedAdminRoutes)
router.use("/patient", patientRoutes)
router.use("/staff", staffRoutes)
router.use("/doctor", doctorRoutes)
router.use("/doctors", publicDoctorRoutes)
router.use("/appointments",appointmentRoutes)
router.use("/doctor/leaves", doctorLeaveRouter)
router.use("/admin/leaves", adminLeaveRouter)
import notificationRoutes from "./notification.routes"
import paymentRoutes from "./payment.routes"
router.use("/notifications", notificationRoutes)
router.use("/payments", paymentRoutes)

export default router
