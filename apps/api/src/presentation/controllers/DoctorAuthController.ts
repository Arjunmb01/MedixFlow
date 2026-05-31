import { StatusCode, MESSAGES } from "@/shared/constants";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { Request, Response, NextFunction } from "express";
import { LoginDoctorUseCase } from "@/application/use-cases/auth/loginDoctor.usecase";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/refreshToken.usecase";
import { LogoutUseCase } from "@/application/use-cases/auth/logout.usecase";
import { ForgotPasswordUseCase } from "@/application/use-cases/auth/forgotPassword.usecase";
import { ResetPasswordUseCase } from "@/application/use-cases/auth/resetPassword.usecase";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/presentation/controllers/dto/validation/auth.dtos";
import { AUTH_COOKIES, COOKIE_OPTIONS, ACCESS_TOKEN_COOKIE_OPTIONS } from "@/shared/constants/auth";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";

export class DoctorAuthController {
    constructor(
        private loginDoctorUseCase: LoginDoctorUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private logoutUseCase: LogoutUseCase,
        private forgotPasswordUseCase: ForgotPasswordUseCase,
        private resetPasswordUseCase: ResetPasswordUseCase
    ) {}

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await this.loginDoctorUseCase.execute(validatedData);

            const { accessToken, refreshToken } = result;

            res.cookie(AUTH_COOKIES.DOCTOR.ACCESS, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
            res.cookie(AUTH_COOKIES.DOCTOR.REFRESH, refreshToken, COOKIE_OPTIONS);

            res.json({ accessToken, user: result.user });
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
            const refreshToken = req.cookies[AUTH_COOKIES.DOCTOR.REFRESH];
            const result = await this.refreshTokenUseCase.execute(refreshToken, UserRole.DOCTOR);
            
            res.cookie(AUTH_COOKIES.DOCTOR.ACCESS, result.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
            
            res.json(result);
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            await this.logoutUseCase.execute(userId, UserRole.DOCTOR);

            res.clearCookie(AUTH_COOKIES.DOCTOR.ACCESS);
            res.clearCookie(AUTH_COOKIES.DOCTOR.REFRESH);
            res.json({ message: MESSAGES.LOGOUT_SUCCESS });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    forgotPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = forgotPasswordSchema.parse(req.body);
            const result = await this.forgotPasswordUseCase.execute(validatedData);
            res.json(result);
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    resetPassword = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = resetPasswordSchema.parse(req.body);
            const result = await this.resetPasswordUseCase.execute(validatedData);
            res.json(result);
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }
}



