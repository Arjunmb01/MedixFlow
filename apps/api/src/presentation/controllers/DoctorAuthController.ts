import { StatusCode, MESSAGES } from "@/shared/constants";
import { Request, Response, NextFunction } from "express";
import { LoginDoctorUseCase } from "@/application/usecases/auth/loginDoctor.usecase";
import { RefreshTokenUseCase } from "@/application/usecases/auth/refreshToken.usecase";
import { LogoutUseCase } from "@/application/usecases/auth/logout.usecase";
import { ForgotPasswordUseCase } from "@/application/usecases/auth/forgotPassword.usecase";
import { ResetPasswordUseCase } from "@/application/usecases/auth/resetPassword.usecase";
import { loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@/presentation/dtos/validation/auth.dtos";

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

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.doctor_refreshToken;
            const result = await this.refreshTokenUseCase.execute(refreshToken, "DOCTOR");
            res.json(result);
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            await this.logoutUseCase.execute(userId);

            res.clearCookie("doctor_refreshToken");
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
