import { StatusCode, MESSAGES } from "@/shared/constants";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { Request, Response, NextFunction } from "express";
import { SignUpUseCase } from "@/application/use-cases/auth/signup.usecase";
import { VerifyOtpUseCase } from "@/application/use-cases/auth/verifyOtp.usecase";
import { LoginPatientUseCase } from "@/application/use-cases/auth/loginPatient.usecase";
import { GoogleAuthUseCase } from "@/application/use-cases/auth/googleAuth.usecase";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/refreshToken.usecase";
import { LogoutUseCase } from "@/application/use-cases/auth/logout.usecase";
import { ResendOtpUseCase } from "@/application/use-cases/auth/resendOtp.usecase";
import { ForgotPasswordUseCase } from "@/application/use-cases/auth/forgotPassword.usecase";
import { ResetPasswordUseCase } from "@/application/use-cases/auth/resetPassword.usecase";
import { signupSchema, verifyOtpSchema, forgotPasswordSchema, resetPasswordSchema, loginSchema } from "@/presentation/controllers/dto/validation/auth.dtos";

export class PatientAuthController {
    constructor(
        private signUpUseCase: SignUpUseCase,
        private verifyOtpUseCase: VerifyOtpUseCase,
        private loginPatientUseCase: LoginPatientUseCase,
        private googleAuthUseCase: GoogleAuthUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private logoutUseCase: LogoutUseCase,
        private resendOtpUseCase: ResendOtpUseCase,
        private forgotPasswordUseCase: ForgotPasswordUseCase,
        private resetPasswordUseCase: ResetPasswordUseCase
    ) {}

    signUp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = signupSchema.parse(req.body);
            const result = await this.signUpUseCase.execute(validatedData);
            res.status(StatusCode.CREATED).json(result);
        } catch (error) {
            next(error);
        }
    }

    verifyOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = verifyOtpSchema.parse(req.body);
            const result = await this.verifyOtpUseCase.execute(validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await this.loginPatientUseCase.execute(validatedData);

            const { accessToken, refreshToken, patientId } = result;

            res.cookie("patient_refreshToken", refreshToken, {
                httpOnly: true,
                secure: false, 
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ accessToken, patientId });
        } catch (error) {
            const message = error instanceof Error ? error.message : "An unexpected error occurred";
            const isBlocked = message.toLowerCase().includes("blocked");
            res.status(isBlocked ? StatusCode.FORBIDDEN : StatusCode.UNAUTHORIZED).json({ 
                message, 
                code: isBlocked ? "ACCOUNT_BLOCKED" : undefined 
            });
        }
    }
    
    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.patient_refreshToken;
            const result = await this.refreshTokenUseCase.execute(refreshToken, UserRole.PATIENT);
            res.json(result);
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            await this.logoutUseCase.execute(userId);

            res.clearCookie("patient_refreshToken");
            res.json({ message: MESSAGES.LOGOUT_SUCCESS });
        } catch (error) {
            next(error);
        }
    }

    resendOtp = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(StatusCode.BAD_REQUEST).json({ message: MESSAGES.EMAIL_REQUIRED });
            }
            const result = await this.resendOtpUseCase.execute(email);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    googleLogin = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { idToken } = req.body;
            if (!idToken) {
                return res.status(StatusCode.BAD_REQUEST).json({ message: MESSAGES.GOOGLE_ID_TOKEN_REQUIRED });
            }

            const { accessToken, refreshToken, patientId } = await this.googleAuthUseCase.execute(idToken);

            res.cookie("patient_refreshToken", refreshToken, {
                httpOnly: true,
                secure: false, // Set to true in production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ accessToken, patientId });
        } catch (error) {
            const message = error instanceof Error ? error.message : "Google authentication failed";
            const isBlocked = message.toLowerCase().includes("blocked");
            res.status(isBlocked ? StatusCode.FORBIDDEN : StatusCode.UNAUTHORIZED).json({ 
                message, 
                code: isBlocked ? "ACCOUNT_BLOCKED" : undefined 
            });
        }
    }

    forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = forgotPasswordSchema.parse(req.body);
            const result = await this.forgotPasswordUseCase.execute(validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);
            const result = await this.resetPasswordUseCase.execute(validatedData);
            res.json(result);
        } catch (error) {
            next(error);
        }
    }
}



