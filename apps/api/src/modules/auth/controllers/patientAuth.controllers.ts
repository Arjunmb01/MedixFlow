import { StatusCode, MESSAGES } from "../../../core/constants";
import { Request, Response, NextFunction } from "express";
import { AuthRepository } from "../repositories/auth.repository";

// Use cases
import { SignUpUseCase } from "../usecases/signup.usecase";
import { VerifyOtpUseCase } from "../usecases/verifyOtp.usecase";
import { LoginPatientUseCase } from "../usecases/loginPatient.usecase";
import { GoogleAuthUseCase } from "../usecases/googleAuth.usecase";
import { RefreshTokenUseCase } from "../usecases/refreshToken.usecase";
import { LogoutUseCase } from "../usecases/logout.usecase";
import { ResendOtpUseCase } from "../usecases/resendOtp.usecase";
import { ForgotPasswordUseCase } from "../usecases/forgotPassword.usecase";
import { ResetPasswordUseCase } from "../usecases/resetPassword.usecase";

// Services
import { OtpService } from "../services/otp.services";
import emailService from "../../../infrastructure/email/email.service";
import { SessionService } from "../services/session.service";

// Types/DTOs
import { signupSchema } from "../dto/signup.dto";
import { verifyOtpSchema } from "../dto/verifyOtp.dto";
import { forgotPasswordSchema, resetPasswordSchema } from "../dto/passwordReset.dto";

const authRepo = new AuthRepository();
const otpService = new OtpService();
const sessionService = new SessionService();

class PatientAuthController {
    async signUp(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = signupSchema.parse(req.body);
            const usecase = new SignUpUseCase(authRepo, otpService, emailService);
            const result = await usecase.execute(validatedData);
            res.status(StatusCode.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    }

    async verifyOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = verifyOtpSchema.parse(req.body);
            const usecase = new VerifyOtpUseCase(authRepo, otpService);
            const result = await usecase.execute(validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { email, password } = req.body;
            const usecase = new LoginPatientUseCase(authRepo);
            const result = await usecase.execute({ email, password });

            const { accessToken, refreshToken } = result;

            res.cookie("patient_refreshToken", refreshToken, {
                httpOnly: true,
                secure: false, // Set to true in production
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
            const refreshToken = req.cookies.patient_refreshToken;
            const usecase = new RefreshTokenUseCase(sessionService, authRepo);
            const result = await usecase.execute(refreshToken, "PATIENT");
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

            res.clearCookie("patient_refreshToken");
            res.json({ message: MESSAGES.LOGOUT_SUCCESS });
        } catch (error) {
            next(error);
        }
    }

    async resendOtp(req: Request, res: Response, next: NextFunction) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(StatusCode.BAD_REQUEST).json({ message: MESSAGES.EMAIL_REQUIRED });
            }
            const usecase = new ResendOtpUseCase(authRepo, otpService, emailService);
            const result = await usecase.execute(email);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async googleLogin(req: Request, res: Response, next: NextFunction) {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(StatusCode.BAD_REQUEST).json({ message: MESSAGES.GOOGLE_ID_TOKEN_REQUIRED });
            }

            const usecase = new GoogleAuthUseCase(authRepo);
            const { accessToken, refreshToken } = await usecase.execute(idToken);

            res.cookie("patient_refreshToken", refreshToken, {
                httpOnly: true,
                secure: false, // Set to true in production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ accessToken });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Google authentication failed";
            const isBlocked = message.toLowerCase().includes("blocked");
            res.status(isBlocked ? 403 : 401).json({ 
                message, 
                code: isBlocked ? "ACCOUNT_BLOCKED" : undefined 
            });
        }
    }

    async forgotPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = forgotPasswordSchema.parse(req.body);
            const usecase = new ForgotPasswordUseCase(authRepo, emailService);
            const result = await usecase.execute(validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    async resetPassword(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);
            const usecase = new ResetPasswordUseCase(authRepo);
            const result = await usecase.execute(validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}

export default new PatientAuthController();