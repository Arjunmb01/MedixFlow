import axiosInstance from "@/core/api/axios";
import type { LoginPayload, RegisterPayload, VerifyOtpPayload, ResendOtpPayload, ForgotPasswordPayload, ResetPasswordPayload } from "@/domain/auth/types/auth.types";

export const patientLogin = async (data: LoginPayload) => {
    const response = await axiosInstance.post("/auth/login", data);
    return response.data;
};

export const patientRegister = async (data: RegisterPayload) => {
    const response = await axiosInstance.post("/auth/register", data);
    return response.data;
};

export const verifyOtp = async (data: VerifyOtpPayload) => {
    const response = await axiosInstance.post("/auth/verify-otp", data);
    return response.data;
};

export const resendOtp = async (data: ResendOtpPayload) => {
    const response = await axiosInstance.post("/auth/resend-otp", data);
    return response.data;
};

export const patientForgotPassword = async (data: ForgotPasswordPayload) => {
    const response = await axiosInstance.post("/auth/forgot-password", data);
    return response.data;
};

export const patientResetPassword = async (data: ResetPasswordPayload) => {
    const response = await axiosInstance.post("/auth/reset-password", data);
    return response.data;
};

export const doctorLogin = async (data: LoginPayload) => {
    const response = await axiosInstance.post("/doctor/auth/login", data);
    return response.data;
};

export const doctorForgotPassword = async (data: ForgotPasswordPayload) => {
    const response = await axiosInstance.post("/doctor/auth/forgot-password", data);
    return response.data;
};

export const doctorResetPassword = async (data: ResetPasswordPayload) => {
    const response = await axiosInstance.post("/doctor/auth/reset-password", data);
    return response.data;
};

export const adminLogin = async (data: LoginPayload) => {
    const response = await axiosInstance.post("/admin/auth/login", data);
    return response.data;
};

export const googleLogin = async (idToken: string) => {
    const response = await axiosInstance.post("/auth/google-login", { idToken });
    return response.data;
};

export const refreshToken = async (role: "PATIENT" | "DOCTOR" | "ADMIN") => {
    const endpoint = role === "PATIENT" ? "/auth/refresh-token" :
                     role === "DOCTOR" ? "/doctor/auth/refresh-token" :
                     "/admin/auth/refresh-token";
    const response = await axiosInstance.get(endpoint);
    return response.data;
};

export const logout = async (role: "PATIENT" | "DOCTOR" | "ADMIN" = "PATIENT") => {
    const endpoint = role === "PATIENT" ? "/auth/logout" :
                     role === "DOCTOR" ? "/doctor/auth/logout" :
                     "/admin/auth/logout";
    const response = await axiosInstance.post(endpoint);
    return response.data;
};

export const patientLogout = () => logout("PATIENT");
export const doctorLogout = () => logout("DOCTOR");
export const adminLogout = () => logout("ADMIN");