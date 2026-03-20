import { Router } from "express";
import authRoutes from "../presentation/routes/patientAuth.routes"
import adminAuthRoutes from "../presentation/routes/adminAuth.routes"
import doctorAuthRoutes from "../presentation/routes/doctorAuth.routes"
import patientRoutes from "../presentation/routes/patient.routes"
import staffRoutes from "../presentation/routes/staff.routes"
import doctorRoutes from "../presentation/routes/doctor.routes"
import sharedAdminRoutes from "../presentation/routes/admin.routes"
import publicDoctorRoutes from "@/presentation/routes/publicDoctor.routes"
import uploadRoutes from "@/presentation/routes/upload.routes"

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

export default router