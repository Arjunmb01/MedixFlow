import { Router } from "express";
import authControllers from "../controllers/patientAuth.controllers";
import { authMiddleware } from "../../../core/middleware/auth.middleware";

const router = Router();

router.post("/signup", authControllers.signUp);
router.post("/verify-otp", authControllers.verifyOtp);
router.post("/login", authControllers.login);
router.post("/refresh-token", authControllers.refreshToken);
router.post("/resend-otp", authControllers.resendOtp);
router.post("/logout", authMiddleware, authControllers.logout);

export default router;