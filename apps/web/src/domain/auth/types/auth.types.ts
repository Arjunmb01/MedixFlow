export type Role = "ADMIN" | "PATIENT" | "DOCTOR";

export interface User {
    id: string;
    email: string;
    role: Role;
    firstName?: string;
    lastName?: string;
}

export interface LoginResponse {
    accessToken: string;
    user?: User;
}

export interface RegisterPayload {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
}

export interface LoginPayload {
    email: string;
    password: string;
}

export interface VerifyOtpPayload {
    email: string;
    otp: string;
}

export interface ResendOtpPayload {
    email: string;
}

export interface ForgotPasswordPayload {
    email: string;
}

export interface ResetPasswordPayload {
    token: string;
    password?: string;
}

export interface RoleState {
    isAuthenticated: boolean;
    user: User | null;
    accessToken: string | null;
}

export interface AuthState {
    ADMIN: RoleState;
    PATIENT: RoleState;
    DOCTOR: RoleState;
    loading: boolean;
    persistedRole: Role | null;
}

