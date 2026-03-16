import { Request, Response } from "express";
import loginAdminUsecase from "../usecases/loginAdmin.usecase";
import { loginSchema } from "../dto/login.dto";
import refreshTokenUsecase from "../usecases/refreshToken.usecase";
import logoutUsecase from "../usecases/logout.usecase";


class AdminAuthController {
    async login(req: Request, res: Response) {
        try {
            let validatedData = await loginSchema.parse(req.body)
            const result = await loginAdminUsecase.execute(validatedData)

            const { accessToken, refreshToken } = result

            res.cookie("admin_refreshToken", refreshToken, {
                httpOnly: true,
                secure: false, // Set to true in production
                sameSite: "strict",
                maxAge: 7 * 24 * 60 * 60 * 1000
            })

            res.json({ accessToken })

        } catch (error) {
            res.status(401).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    async refreshToken(req: Request, res: Response) {

        try {

            const refreshToken = req.cookies.admin_refreshToken;

            const result = await refreshTokenUsecase.execute(refreshToken, "ADMIN");

            res.json(result);

        } catch (error) {

            res.status(401).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });

        }

    }

    async logout(req: Request, res: Response) {

        try {

            const userId = req.user.id

            await logoutUsecase.execute(userId);

            res.clearCookie("admin_refreshToken");

            res.json({ message: "Logged out successfully" });

        } catch (error) {

            res.status(400).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });

        }

    }

}

export default new AdminAuthController();
