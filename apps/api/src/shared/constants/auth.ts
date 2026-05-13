import { CookieOptions } from "express";
import { env } from "../config/env";

export const AUTH_COOKIES = {
    ADMIN: {
        ACCESS: "admin_access_token",
        REFRESH: "admin_refresh_token",
    },
    DOCTOR: {
        ACCESS: "doctor_access_token",
        REFRESH: "doctor_refresh_token",
    },
    PATIENT: {
        ACCESS: "patient_access_token",
        REFRESH: "patient_refresh_token",
    },
} as const;

export const COOKIE_OPTIONS: CookieOptions = {
    httpOnly: true,
    secure: env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days for refresh token
};

export const ACCESS_TOKEN_COOKIE_OPTIONS: CookieOptions = {
    ...COOKIE_OPTIONS,
    maxAge: 1 * 60 * 60 * 1000, // 1 hour for access token
};
