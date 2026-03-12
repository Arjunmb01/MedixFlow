import { Router } from "express";
import adminAuthController from "../controllers/adminAuth.controller";
import { authMiddleware } from "../../../core/middleware/auth.middleware";

const router = Router()

router.post('/login',adminAuthController.login)
router.post('/refresh-token',adminAuthController.refreshToken)
router.post('/logout', authMiddleware, adminAuthController.logout)


export default router