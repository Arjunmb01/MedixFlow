import { Request, Response, NextFunction } from "express";
import { StatusCode, MESSAGES } from "@/shared/constants";
import { UserRole } from "@/domain/value-objects/enums/UserRole";
import { LoginAdminUseCase } from "@/application/use-cases/auth/loginAdmin.usecase";
import { RefreshTokenUseCase } from "@/application/use-cases/auth/refreshToken.usecase";
import { LogoutUseCase } from "@/application/use-cases/auth/logout.usecase";
import { loginSchema } from "@/presentation/controllers/dto/validation/auth.dtos";
import { AUTH_COOKIES, COOKIE_OPTIONS, ACCESS_TOKEN_COOKIE_OPTIONS } from "@/shared/constants/auth";
import { AuthenticatedRequest } from "@/shared/middlewares/auth.middleware";

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

            res.cookie(AUTH_COOKIES.ADMIN.ACCESS, accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
            res.cookie(AUTH_COOKIES.ADMIN.REFRESH, refreshToken, COOKIE_OPTIONS);

            res.json({ accessToken, user: result.user });
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    refreshToken = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const refreshToken = req.cookies[AUTH_COOKIES.ADMIN.REFRESH];
            const result = await this.refreshTokenUseCase.execute(refreshToken, UserRole.ADMIN);
            
            res.cookie(AUTH_COOKIES.ADMIN.ACCESS, result.accessToken, ACCESS_TOKEN_COOKIE_OPTIONS);
            
            res.json(result);
        } catch (error) {
            res.status(StatusCode.UNAUTHORIZED).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    logout = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id: userId, sessionId } = req.user;
            await this.logoutUseCase.execute(userId, UserRole.ADMIN, sessionId);

            res.clearCookie(AUTH_COOKIES.ADMIN.ACCESS);
            res.clearCookie(AUTH_COOKIES.ADMIN.REFRESH);
            res.json({ message: MESSAGES.LOGOUT_SUCCESS });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }
}



