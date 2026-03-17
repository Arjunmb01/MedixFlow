import { Router } from "express";
import authRoutes from "../modules/auth/routes/patientAuth.routes"
import adminRoutes from "../modules/auth/routes/adminAuth.routes"
import patientRoutes from '../modules/patient/routes/patient.routes'
import staffRoutes from '../modules/Staff/routes/staff.routes'
import sharedAdminRoutes from '../modules/Staff/routes/admin.routes'

const router = Router()
router.use("/auth",authRoutes)
router.use("/admin/auth",adminRoutes)
router.use("/admin", sharedAdminRoutes)
router.use("/patient",patientRoutes)
router.use("/staff", staffRoutes)

export default router