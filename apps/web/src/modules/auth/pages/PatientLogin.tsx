import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { GoogleLogin, type CredentialResponse } from "@react-oauth/google"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"

import { useAppDispatch } from "@/core/store/hooks"
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
        <div className="flex items-center justify-center min-h-screen bg-gray-200 font-outfit">
            <form
                onSubmit={handleSubmit(onFormSubmit)}
                noValidate
                className="bg-white px-10 py-10 rounded-xl shadow-sm w-[440px]"
            >
                {/* Logo */}
                <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-lg bg-[#0066cc] mb-6 shadow-md shadow-blue-100">
                   <span className="text-white font-bold text-lg">M</span>
                </div>

                <h2 className="text-[22px] font-bold text-center text-gray-900 tracking-tight">
                    Welcome back
                </h2>

                <p className="text-[14px] text-gray-500 text-center mt-2 mb-8 font-medium">
                    Sign in to your patient portal
                </p>

                {errorMessage && (
                    <div className="mb-6 p-4 bg-red-50 text-red-600 text-[13px] rounded-xl border border-red-100 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        <span className="font-semibold">{errorMessage}</span>
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
                        <div className="w-full border-t border-gray-100"></div>
                    </div>
                    <div className="relative bg-white px-3 text-[10px] font-bold text-gray-400 tracking-[0.1em] uppercase">
                        OR EMAIL
                    </div>
                </div>

                <div className="mb-5">
                    <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">
                        Email Address
                    </label>
                    <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.email ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#0066cc]'}`}>
                            <Mail className="w-4.5 h-4.5" />
                        </div>
                        <input
                            {...register("email")}
                            type="email"
                            placeholder="name@example.com"
                            className={`w-full bg-gray-50 border-2 rounded-xl pl-12 pr-4 py-3.5 text-sm transition-all outline-none font-medium placeholder:text-gray-300 ${
                                errors.email 
                                    ? 'border-red-100 focus:border-red-200 focus:ring-4 focus:ring-red-50/50 text-red-600' 
                                    : 'border-transparent focus:bg-white focus:border-[#0066cc]/20 focus:ring-4 focus:ring-blue-50/50'
                            }`}
                        />
                    </div>
                    {errors.email && (
                        <p className="mt-1.5 ml-1 text-[12px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2 ml-1">
                        <label className="block text-[12px] font-bold text-gray-400 uppercase tracking-wider">
                            Password
                        </label>
                        <Link to="/forgot-password" title="Reset your password" className="text-[12px] text-[#0066cc] font-bold hover:underline uppercase tracking-wider">
                            Forgot?
                        </Link>
                    </div>
                    <div className="relative group">
                        <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${errors.password ? 'text-red-400' : 'text-gray-400 group-focus-within:text-[#0066cc]'}`}>
                            <Lock className="w-4.5 h-4.5" />
                        </div>
                        <input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            className={`w-full bg-gray-50 border-2 rounded-xl pl-12 pr-12 py-3.5 text-sm transition-all outline-none font-bold tracking-widest placeholder:tracking-normal placeholder:font-medium placeholder:text-gray-300 ${
                                errors.password 
                                    ? 'border-red-100 focus:border-red-200 focus:ring-4 focus:ring-red-50/50 text-red-600' 
                                    : 'border-transparent focus:bg-white focus:border-[#0066cc]/20 focus:ring-4 focus:ring-blue-50/50'
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                    </div>
                    {errors.password && (
                        <p className="mt-1.5 ml-1 text-[12px] font-bold text-red-500 animate-in fade-in slide-in-from-top-1">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#0066cc] hover:bg-blue-700 text-white font-black py-4 text-[15px] rounded-xl transition-all shadow-lg shadow-blue-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? "Verifying..." : "Sign in to Dashboard"}
                </button>

                <div className="text-center text-[13px] text-gray-400 mt-8 font-bold">
                    Don't have an account?{" "}
                    <Link to="/auth/register" className="text-[#0066cc] hover:underline ml-1">
                        Create one
                    </Link>
                </div>

            </form>
        </div>
    )
}