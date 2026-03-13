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

export interface AuthState {
    accessToken : string | null
    userRole : "ADMIN" | "PATIENT" | "DOCTOR" | null
    loading : boolean
}