import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useAppDispatch } from "@/core/store/hooks"
import { UserRole } from "../types/auth.types"
import { setAuth } from "../../store/authSlice"

import { patientLogin, googleLogin } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"

import { Eye, EyeOff, Lock, Mail, AlertCircle } from "lucide-react"

const loginSchema = z.object({
  email: z.string().min(1, "Email address is required").email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required")
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function PatientLogin() {
    const navigate = useNavigate()
    const dispatch = useAppDispatch()

    const [showPassword, setShowPassword] = useState(false)
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: ""
        }
    })

    const onFormSubmit = async (data: LoginFormValues) => {
        setErrorMessage(null)
        setLoading(true)

        try {
            const response = await patientLogin(data)
            const { accessToken } = response
            dispatch(
                setAuth({
                    role: UserRole.PATIENT,
                    accessToken
                })
            )
            toast.success("Login successful!")
            navigate("/dashboard")
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
        } finally {
            setLoading(false)
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
            const { accessToken } = response
            dispatch(
                setAuth({
                    role: UserRole.PATIENT,
                    accessToken
                })
            )
            toast.success("Login successful!")
            navigate("/dashboard")
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
        <div className="flex items-center justify-center min-h-screen bg-gray-50/50 font-outfit px-4">
            <form
                onSubmit={handleSubmit(onFormSubmit)}
                noValidate
                className="bg-white px-8 py-10 md:px-10 rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 w-full max-w-[460px]"
            >
                {/* Logo */}
                <div className="flex justify-center mb-10">
                    <Link to="/">
                        <img src="/logo.png" alt="MedixFlow Logo" className="h-20 w-auto object-contain" />
                    </Link>
                </div>

                <h2 className="text-[26px] font-black text-center text-gray-900 tracking-tight leading-tight">
                    Welcome back
                </h2>

                <p className="text-[14px] text-gray-400 text-center mt-2 mb-10 font-bold uppercase tracking-widest">
                    Patient Portal
                </p>

                {errorMessage && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 text-[13px] rounded-2xl border border-red-100/50 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <span className="font-bold">{errorMessage}</span>
                    </div>
                )}

                {/* Google Login */}
                <div className="mb-8 flex justify-center">
                    <GoogleLogin
                        onSuccess={handleGoogleSuccess}
                        onError={handleGoogleError}
                        width="380"
                        text="continue_with"
                        shape="pill"
                        logo_alignment="left"
                    />
                </div>

                {/* OR EMAIL Divider */}
                <div className="relative flex items-center justify-center mb-10">
                    <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative bg-white px-4 text-[11px] font-black text-gray-300 tracking-[0.2em] uppercase">
                        Secure login
                    </div>
                </div>

                <div className="mb-6">
                    <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em] mb-2.5 ml-1">
                        Email Address
                    </label>
                    <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-300 group-focus-within:text-primary-600'}`}>
                            <Mail className="w-5 h-5" />
                        </div>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="name@example.com"
                            className={`w-full bg-gray-50/50 border-2 rounded-2xl pl-12 pr-4 py-4 text-sm transition-all outline-none font-bold placeholder:text-gray-300 placeholder:font-medium ${
                                errors.email 
                                    ? 'border-red-100 focus:border-red-400 focus:ring-4 focus:ring-red-50/50 text-red-600' 
                                    : 'border-gray-50 focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30'
                            }`}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-2 ml-1 text-[12px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="mb-10">
                    <div className="flex justify-between items-center mb-2.5 ml-1">
                        <label className="block text-[11px] font-black text-gray-400 uppercase tracking-[0.15em]">
                            Password
                        </label>
                        <Link to="/forgot-password" title="Reset your password" className="text-[11px] text-primary-600 font-black hover:text-primary-700 transition-colors uppercase tracking-[0.1em]">
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-300 group-focus-within:text-primary-600'}`}>
                            <Lock className="w-5 h-5" />
                        </div>
                        <input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full bg-gray-50/50 border-2 rounded-2xl pl-12 pr-12 py-4 text-sm transition-all outline-none font-black tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300 ${
                                errors.password 
                                    ? 'border-red-100 focus:border-red-400 focus:ring-4 focus:ring-red-50/50 text-red-600' 
                                    : 'border-gray-50 focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/30'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-2 ml-1 text-[12px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black py-4.5 text-[16px] rounded-2xl transition-all shadow-xl shadow-primary-100 hover:shadow-primary-200 active:scale-[0.98] active:shadow-inner disabled:opacity-70 disabled:cursor-not-allowed group"
                >
                    <span className="flex items-center justify-center gap-2">
                        {loading ? "Verifying workspace..." : "Sign in to Dashboard"}
                        {!loading && <span className="group-hover:translate-x-1 transition-transform">→</span>}
                    </span>
                </button>

                <div className="text-center text-[14px] text-gray-400 mt-10 font-bold">
                    New to MedixFlow?{" "}
                    <Link to="/auth/register" className="text-primary-600 hover:text-primary-700 font-black ml-1 transition-colors">
                        Create account
                    </Link>
                </div>

            </form>
        </div>
    )
}