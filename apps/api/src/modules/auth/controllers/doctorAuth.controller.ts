import { StatusCode, MESSAGES } from "../../../core/constants";
import { Request, Response, NextFunction } from "express";
import { AuthRepository } from "../repositories/auth.repository";
import { SessionService } from "../services/session.service";
import emailService from "../../../infrastructure/email/email.service";

// Use cases
import { LoginDoctorUseCase } from "../usecases/loginDoctor.usecase";
import { RefreshTokenUseCase } from "../usecases/refreshToken.usecase";
import { LogoutUseCase } from "../usecases/logout.usecase";
import { ForgotPasswordUseCase } from "../usecases/forgotPassword.usecase";
import { ResetPasswordUseCase } from "../usecases/resetPassword.usecase";

// DTOs
import { loginSchema } from "../dto/login.dto";
import { forgotPasswordSchema, resetPasswordSchema } from "../dto/passwordReset.dto";

const authRepo = new AuthRepository();
const sessionService = new SessionService();

class DoctorAuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const usecase = new LoginDoctorUseCase(authRepo);
            const result = await usecase.execute(validatedData);

            const { accessToken, refreshToken } = result;

            res.cookie("doctor_refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ accessToken });
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            const isBlocked = message.toLowerCase().includes("blocked");
            res.status(isBlocked ? 403 : 401).json({ 
                message, 
                code: isBlocked ? "ACCOUNT_BLOCKED" : undefined 
            });
        }
    }

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.doctor_refreshToken;
            const usecase = new RefreshTokenUseCase(sessionService, authRepo);
            const result = await usecase.execute(refreshToken, "DOCTOR");
            res.json(result);
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user.id;
            const usecase = new LogoutUseCase(sessionService);
            await usecase.execute(userId);

            res.clearCookie("doctor_refreshToken");
            res.json({ message: MESSAGES.LOGOUT_SUCCESS });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = forgotPasswordSchema.parse(req.body);
            const usecase = new ForgotPasswordUseCase(authRepo, emailService);
            const result = await usecase.execute(validatedData);
            res.json(result);
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);
            const usecase = new ResetPasswordUseCase(authRepo);
            const result = await usecase.execute(validatedData);
            res.json(result);
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }
}

export default new DoctorAuthController();
