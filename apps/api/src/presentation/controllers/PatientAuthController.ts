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
import { AUTH_COOKIES, COOKIE_OPTIONS, ACCESS_TOKEN_COOKIE_OPTIONS } from "@/shared/constants/auth";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";

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

            res.cookie(AUTH_COOKIES.PATIENT.ACCESS, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
            res.cookie(AUTH_COOKIES.PATIENT.REFRESH, refreshToken, COOKIE_OPTIONS);

            res.json({ accessToken, patientId, user: result.user });
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
            const refreshToken = req.cookies[AUTH_COOKIES.PATIENT.REFRESH];
            const result = await this.refreshTokenUseCase.execute(refreshToken, UserRole.PATIENT);
            
            res.cookie(AUTH_COOKIES.PATIENT.ACCESS, result.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
            
            res.json(result);
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            await this.logoutUseCase.execute(userId, UserRole.PATIENT);

            res.clearCookie(AUTH_COOKIES.PATIENT.ACCESS);
            res.clearCookie(AUTH_COOKIES.PATIENT.REFRESH);
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

            const result = await this.googleAuthUseCase.execute(idToken);
            const { accessToken, refreshToken, patientId } = result;

            res.cookie(AUTH_COOKIES.PATIENT.ACCESS, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
            res.cookie(AUTH_COOKIES.PATIENT.REFRESH, refreshToken, COOKIE_OPTIONS);

            res.json({ accessToken, patientId, user: result.user });
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



