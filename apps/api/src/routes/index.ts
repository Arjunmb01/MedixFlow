import { Router } from "express";
import authRoutes from "../modules/auth/routes/patientAuth.routes"
import adminRoutes from "../modules/auth/routes/adminAuth.routes"

const router = Router()
router.use("/auth",authRoutes)
router.use("/admin/auth",adminRoutes)

export default router