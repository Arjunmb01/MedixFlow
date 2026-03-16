import { Router } from "express";
import adminAuthController from "../controllers/adminAuth.controller";
import { authMiddleware } from "../../../core/middleware/auth.middleware";
import { authorize } from "../../../core/middleware/authorize.middleware";

const router = Router()

router.post('/login',adminAuthController.login)
router.post('/refresh-token',adminAuthController.refreshToken)
router.post('/logout', authMiddleware, authorize(["ADMIN"]), adminAuthController.logout)


export default router