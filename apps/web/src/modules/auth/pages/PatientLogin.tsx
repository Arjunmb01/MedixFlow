import { useState, type ChangeEvent, type FormEvent } from "react"
import { useNavigate, Link } from "react-router-dom"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"

import { useAppDispatch } from "@/core/store/hooks"
import { setAuth } from "../../store/authSlice"

import { patientLogin, googleLogin } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"

import type { LoginPayload } from "../types/auth.types"


import { Eye, EyeOff, Lock, Mail } from "lucide-react"

export default function PatientLogin() {

    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [form, setForm] = useState<LoginPayload>({
        email: "",
        password: ""
    })
    const [showPassword, setShowPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)


    const handleChange = (
        e: ChangeEvent<HTMLInputElement>
    ) => {
        const { name, value } = e.target
        setForm(prev => ({
            ...prev,
            [name]: value
        }))
    }


    const handleSubmit = async (
        e: FormEvent<HTMLFormElement>
    ) => {
        e.preventDefault()
        setErrorMessage(null)

        try {
            const response = await patientLogin(form)
            const { accessToken } = response.data
            dispatch(
                setAuth({
                    role: "PATIENT",
                    accessToken
                })
            )
            toast.success("Login successful!")
            navigate("/patient/dashboard")
        } catch (error: any) {
            console.error("Login failed:", error)
            const msg = error.response?.data?.message || "Login failed. Please check your credentials."
            setErrorMessage(msg)

            if (msg.includes("Doctor account")) {
                toast.error("Doctor account detected", {
                    description: "Please log in through the Doctor Portal.",
                    action: {
                        label: "Go to Doctor Portal",
                        onClick: () => navigate("/doctor/login")
                    }
                })
            } else if (msg.includes("Admin account")) {
                toast.error("Admin account detected", {
                    description: "Please log in through the Admin Portal.",
                    action: {
                        label: "Go to Admin Portal",
                        onClick: () => navigate("/admin/login")
                    }
                })
            } else if (error.response?.data?.code === "ACCOUNT_BLOCKED") {
                toast.error(msg)
            }
        }
    }


    const handleGoogleSuccess = async (credentialResponse: CredentialResponse) => {
        setErrorMessage(null)

        if (!credentialResponse.credential) {
            setErrorMessage("Google login failed: no credential received.")
            return
        }

        try {
            const response = await googleLogin(credentialResponse.credential)
            const { accessToken } = response.data
            dispatch(
                setAuth({
                    role: "PATIENT",
                    accessToken
                })
            )
            toast.success("Login successful!")
            navigate("/patient/dashboard")
        } catch (error: any) {
            console.error("Google login failed:", error)
            const msg = error.response?.data?.message || "Google login failed. Please try again."
            setErrorMessage(msg)

            if (msg.includes("Doctor account")) {
              toast.error("Doctor account detected", {
                description: "This Google account is linked to a Doctor profile.",
                action: {
                  label: "Go to Doctor Portal",
                  onClick: () => navigate("/doctor/login")
                }
              })
            } else if (msg.includes("Admin account")) {
              toast.error("Admin account detected", {
                description: "This Google account is linked to an Admin profile.",
                action: {
                  label: "Go to Admin Portal",
                  onClick: () => navigate("/admin/login")
                }
              })
            } else if (error.response?.data?.code === "ACCOUNT_BLOCKED") {
                toast.error(msg)
            }
        }
    }


    const handleGoogleError = () => {
        setErrorMessage("Google sign-in was cancelled or failed. Please try again.")
    }


    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-200">
            <form
                onSubmit={handleSubmit}
                className="bg-white px-10 py-10 rounded-xl shadow-sm w-[440px]"
            >
                {/* Logo */}
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[#0066cc] mb-6">
                   <span className="text-white font-bold text-lg">M</span>
                </div>

                <h2 className="text-[22px] font-bold text-center text-gray-900">
                    Welcome back
                </h2>

                <p className="text-[14px] text-gray-500 text-center mt-2 mb-8">
                    Sign in to your patient portal
                </p>

                {errorMessage && (
                    <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100 text-center">
                        {errorMessage}
                    </div>
                )}

                {/* Google Login */}
                <div className="mb-6 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        width="360"
                        text="continue_with"
                        shape="rectangular"
                        logo_alignment="left"
                    />
                </div>

                {/* OR EMAIL Divider */}
                <div className="relative flex items-center justify-center mb-8">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                    </div>
                    <div className="relative bg-white px-3 text-[11px] font-medium text-gray-400 tracking-wider">
                        OR EMAIL
                    </div>
                </div>

                <div className="mb-4">
                    <label className="block text-[13px] text-gray-600 font-medium mb-1">
                        Email Address
                    </label>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Mail className="w-4 h-4" />
                        </div>
                        <input
                            name="email"
                            type="email"
                            placeholder="name@example.com"
                            className="w-full border border-gray-200 rounded-md pl-10 pr-3 py-[10px] text-sm focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none transition-all placeholder:text-gray-400"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-1">
                        <label className="block text-[13px] text-gray-600 font-medium">
                            Password
                        </label>
                        <Link to="/forgot-password" title="Reset your password" className="text-[13px] text-[#0066cc] font-medium hover:underline">
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative">
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                            <Lock className="w-4 h-4" />
                        </div>
                        <input
                            name="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className="w-full border border-gray-200 rounded-md pl-10 pr-10 py-[10px] text-sm focus:border-[#0a66c2] focus:ring-1 focus:ring-[#0a66c2] outline-none transition-all placeholder:text-gray-600"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                    </div>
                </div>

                <button
                    type="submit"
                    className="w-full bg-[#0066cc] text-white font-medium py-[10px] text-[15px] rounded-md hover:bg-blue-700 transition-colors"
                >
                    Sign in
                </button>

                <div className="text-center text-[13px] text-gray-500 mt-8">
                    Don't have an account?{" "}
                    <Link to="/auth/register" className="text-[#0066cc] hover:underline font-medium ml-1">
                        Create one
                    </Link>
                </div>

            </form>
        </div>
    )
}