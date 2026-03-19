import { Router } from "express"
import { authMiddleware } from "@/core/middleware/auth.middleware"
import { authorize } from "@/core/middleware/authorize.middleware"
import * as controller from "../controllers/doctor.controller"

const router = Router()

router.use(authMiddleware, authorize(["DOCTOR"]))

router.get("/profile", controller.getDoctorProfile)
router.put("/profile", controller.updateDoctorProfile)
router.put("/password", controller.updateDoctorPassword)
router.put("/schedules", controller.updateDoctorSchedules)
router.get("/dashboard/stats", controller.getDoctorDashboardStats)

export default router
