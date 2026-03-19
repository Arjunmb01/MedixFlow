import { Request, Response, NextFunction } from "express";
import { StatusCode, MESSAGES } from "../../../core/constants";
import { AuthRepository } from "../repositories/auth.repository";
import { SessionService } from "../services/session.service";

// Use cases
import { LoginAdminUseCase } from "../usecases/loginAdmin.usecase";
import { RefreshTokenUseCase } from "../usecases/refreshToken.usecase";
import { LogoutUseCase } from "../usecases/logout.usecase";

// DTOs
import { loginSchema } from "../dto/login.dto";

const authRepo = new AuthRepository();
const sessionService = new SessionService();

class AdminAuthController {
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const validatedData = loginSchema.parse(req.body);
            const usecase = new LoginAdminUseCase(authRepo);
            const result = await usecase.execute(validatedData);

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

    async refreshToken(req: Request, res: Response, next: NextFunction) {
        try {
            const refreshToken = req.cookies.admin_refreshToken;
            const usecase = new RefreshTokenUseCase(sessionService, authRepo);
            const result = await usecase.execute(refreshToken, "ADMIN");
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

            res.clearCookie("admin_refreshToken");
            res.json({ message: MESSAGES.LOGOUT_SUCCESS });
        } catch (error) {
            res.status(StatusCode.BAD_REQUEST).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }
}

export default new AdminAuthController();
