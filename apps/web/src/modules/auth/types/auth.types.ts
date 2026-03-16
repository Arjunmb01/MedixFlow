export interface LoginPayload {
  email: string
  password: string
}

export interface RegisterPayload {
  firstName: string
  lastName: string
  email: string
  phone: string
  password: string
  acceptedTerms: boolean
}

export interface VerifyOtpPayload {
  email: string
  otp: string
}

export interface LoginResponse {
  accessToken: string
}

export type Role = "ADMIN" | "PATIENT" | "DOCTOR"

export interface User {
  id: string
  email: string
  role: Role
}

export interface RoleState {
  isAuthenticated: boolean
  user: User | null
  accessToken: string | null
}

export interface AuthState {
  ADMIN: RoleState
  PATIENT: RoleState
  DOCTOR: RoleState
  loading: boolean
}