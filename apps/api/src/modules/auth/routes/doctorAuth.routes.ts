import { Router } from "express"
import doctorAuthController from "../controllers/doctorAuth.controller"
import { authMiddleware } from "../../../core/middleware/auth.middleware"
import { authorize } from "../../../core/middleware/authorize.middleware"

const router = Router()

router.post("/login", doctorAuthController.login)
router.post("/refresh-token", doctorAuthController.refreshToken)
router.post("/logout", authMiddleware, authorize(["DOCTOR"]), doctorAuthController.logout)
router.post("/forgot-password", doctorAuthController.forgotPassword)
router.post("/reset-password", doctorAuthController.resetPassword)

export default router
