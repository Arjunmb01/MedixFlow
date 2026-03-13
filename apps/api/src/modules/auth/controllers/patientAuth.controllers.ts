import { Request, Response } from "express";
import signupUsecase from "../usecases/signup.usecase";
import verifyOtpUsecase from "../usecases/verifyOtp.usecase";
import loginUsecase from "../usecases/loginPatient.usecase";
import { signupSchema } from "../dto/signup.dto";
import { loginSchema } from "../dto/login.dto";
import { verifyOtpSchema } from "../dto/verifyOtp.dto";
import logoutUsecase from "../usecases/logout.usecase";
import refreshTokenUsecase from "../usecases/refreshToken.usecase";
import resendOtpUsecase from "../usecases/resendOtp.usecase";


class PatientAuthController {
    async signUp(req: Request, res: Response) {
        try {
            const validatedData = signupSchema.parse(req.body);
            const result = await signupUsecase.execute(validatedData)
            res.status(201).json(result)
        } catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    async verifyOtp(req: Request, res: Response) {
        try {
            const validatedData = verifyOtpSchema.parse(req.body);
            const result = await verifyOtpUsecase.execute(validatedData);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

    async login(req: Request, res: Response) {
        try {
            const { email, password } = req.body
            const result = await loginUsecase.execute({ email, password })

            const { accessToken, refreshToken } = result

            res.cookie("refreshToken", refreshToken, {
                httpOnly: true,
                secure: false,
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

            const refreshToken = req.cookies.refreshToken;

            const result = await refreshTokenUsecase.execute(refreshToken);

            res.json(result);

        } catch (error) {

            res.status(401).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });

        }

    }

    async logout(req: Request, res: Response) {

        try {

            const userId = req.user.id

            await logoutUsecase.execute(userId);

            res.clearCookie("refreshToken");

            res.json({ message: "Logged out successfully" });

        } catch (error) {

            res.status(400).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });

        }

    }

    async resendOtp(req: Request, res: Response) {
        try {
            const { email } = req.body;
            if (!email) {
                return res.status(400).json({ message: "Email is required" });
            }
            const result = await resendOtpUsecase.execute(email);
            res.json(result);
        } catch (error) {
            res.status(400).json({ message: error instanceof Error ? error.message : "An unexpected error occurred" });
        }
    }

}

export default new PatientAuthController();