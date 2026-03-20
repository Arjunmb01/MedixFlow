import { Request, Response, NextFunction } from "express";
import { StatusCode, MESSAGES } from "@/shared/constants";
import { LoginAdminUseCase } from "@/application/usecases/auth/loginAdmin.usecase";
import { RefreshTokenUseCase } from "@/application/usecases/auth/refreshToken.usecase";
import { LogoutUseCase } from "@/application/usecases/auth/logout.usecase";
import { loginSchema } from "@/presentation/dtos/validation/auth.dtos";

export class AdminAuthController {
    constructor(
        private loginAdminUseCase: LoginAdminUseCase,
        private refreshTokenUseCase: RefreshTokenUseCase,
        private logoutUseCase: LogoutUseCase
    ) {}

    login = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const validatedData = loginSchema.parse(req.body);
            const result = await this.loginAdminUseCase.execute(validatedData);

            const { accessToken, refreshToken } = result;

            res.cookie("admin_refreshToken", refreshToken, {
                httpOnly: true,
                secure: false, // Set to true in production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({ accessToken });
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies.admin_refreshToken;
            const result = await this.refreshTokenUseCase.execute(refreshToken, "ADMIN");
            res.json(result);
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    logout = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const userId = req.user.id;
            await this.logoutUseCase.execute(userId);

            res.clearCookie("admin_refreshToken");
            res.json({ message: MESSAGES.LOGOUT_SUCCESS });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }
}
