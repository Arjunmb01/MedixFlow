export enum UserRole {
    ADMIN = "ADMIN",
    PATIENT = "PATIENT",
    DOCTOR = "DOCTOR"
}

export type Role = UserRole;

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
    [UserRole.ADMIN]: RoleState;
    [UserRole.PATIENT]: RoleState;
    [UserRole.DOCTOR]: RoleState;
    loading: boolean;
    persistedRole: Role | null;
}
