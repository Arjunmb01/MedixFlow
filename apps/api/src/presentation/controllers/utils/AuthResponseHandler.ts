import { Response } from "express";
import { StatusCode } from "@/shared/constants";

export interface AuthResult {
    accessToken: string;
    refreshToken: string;
}

export class AuthResponseHandler {
    static handlePatientAuth(res: Response, result: AuthResult) {
        this.setCookie(res, "patient_refreshToken", result.refreshToken);
        return res.json({ accessToken: result.accessToken });
    }

    static handleDoctorAuth(res: Response, result: AuthResult) {
        this.setCookie(res, "doctor_refreshToken", result.refreshToken);
        return res.json({ accessToken: result.accessToken });
    }

    static handleAdminAuth(res: Response, result: AuthResult) {
        this.setCookie(res, "admin_refreshToken", result.refreshToken);
        return res.json({ accessToken: result.accessToken });
    }

    static handleError(res: Response, error: unknown) {
        const message = error instanceof Error ? error.message : "An unexpected error occurred";
        const isBlocked = message.toLowerCase().includes("blocked");

        return res.status(isBlocked ? StatusCode.FORBIDDEN : StatusCode.UNAUTHORIZED).json({
            message,
            code: isBlocked ? "ACCOUNT_BLOCKED" : undefined
        });
    }

    private static setCookie(res: Response, name: string, token: string) {
        res.cookie(name, token, {
            httpOnly: true,
            secure: false,
            sameSite: "strict",
            maxAge: 7 * 24 * 60 * 60 * 1000 
        });
    }
}
