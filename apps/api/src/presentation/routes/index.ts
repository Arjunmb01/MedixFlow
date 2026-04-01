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

export default router
