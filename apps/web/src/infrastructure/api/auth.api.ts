import api from "@/core/api/axios"

import type {
  LoginPayload,
  RegisterPayload,
  VerifyOtpPayload,
  LoginResponse
} from "@/modules/auth/types/auth.types"

import type { AxiosResponse } from "axios"


interface SignupResponse {
  message: string
}

interface ResendOtpResponse {
  message: string
}

export const signup = (
  data: RegisterPayload
): Promise<AxiosResponse<SignupResponse>> => {
  return api.post("/auth/register", data)
}


export const verifyOtp = (
  data: VerifyOtpPayload
): Promise<AxiosResponse<{ message: string }>> => {
  return api.post("/auth/verify-otp", data)
}

export const resendOtp = (
  data: { email: string }
): Promise<AxiosResponse<ResendOtpResponse>> => {
  return api.post("/auth/resend-otp", data)
}


export const patientLogin = (
  data: LoginPayload
): Promise<AxiosResponse<LoginResponse>> => {
  return api.post("/patient/login", data)
}

export const googleLogin = (
  idToken: string
): Promise<AxiosResponse<LoginResponse>> => {
  return api.post("/auth/google-login", { idToken })
}


export const adminLogin = (
  data: LoginPayload
): Promise<AxiosResponse<LoginResponse>> => {
  return api.post("/admin/auth/login", data)
}


export const refreshToken = (): Promise<
  AxiosResponse<LoginResponse>
> => {
  return api.post("/auth/refresh-token")
}


export const logout = (): Promise<
  AxiosResponse<{ message: string }>
> => {
  return api.post("/auth/logout")
}