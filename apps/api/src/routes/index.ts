import { Router } from "express";
import authRoutes from "../modules/auth/routes/patientAuth.routes"
import adminRoutes from "../modules/auth/routes/adminAuth.routes"
import doctorAuthRoutes from "../modules/auth/routes/doctorAuth.routes"
import patientRoutes from '../modules/patient/routes/patient.routes'
import staffRoutes from '../modules/Staff/routes/staff.routes'
import doctorRoutes from '../modules/Staff/routes/doctor.routes'
import sharedAdminRoutes from '../modules/Staff/routes/admin.routes'
import publicDoctorRoutes from '../modules/Staff/routes/publicDoctor.routes'
import uploadRoutes from '../modules/Staff/routes/upload.routes'

const router = Router()
router.use("/common", uploadRoutes)
router.use("/auth", authRoutes)
router.use("/admin/auth", adminRoutes)
router.use("/doctor/auth", doctorAuthRoutes)
router.use("/admin", sharedAdminRoutes)
router.use("/patient", patientRoutes)
router.use("/staff", staffRoutes)
router.use("/doctor", doctorRoutes)
router.use("/doctors", publicDoctorRoutes)

export default router