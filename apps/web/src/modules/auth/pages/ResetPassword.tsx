import { useState } from "react"
import { useSearchParams, useNavigate, useLocation } from "react-router-dom"
import { patientResetPassword, doctorResetPassword } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"
import { Lock, Eye, EyeOff, CheckCircle2 } from "lucide-react"

export default function ResetPassword() {
    const navigate = useNavigate()
    const location = useLocation()
    const [searchParams] = useSearchParams()
    const token = searchParams.get("token")
    const isDoctor = location.pathname.includes("doctor")
    
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirmPassword) {
            toast.error("Passwords do not match")
            return
        }
        if (!token) {
            toast.error("Invalid or missing reset token")
            return
        }

        setLoading(true)
        try {
            if (isDoctor) {
                await doctorResetPassword({ token, password })
            } else {
                await patientResetPassword({ token, password })
            }
            setSuccess(true)
            toast.success("Password reset successfully!")
            setTimeout(() => {
                navigate(isDoctor ? "/doctor/login" : "/patient/login")
            }, 3000)
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to reset password")
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-outfit">
                <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-xl shadow-green-100 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900">Success!</h1>
                        <p className="text-gray-500 font-medium">
                            Your password has been reset successfully. Redirecting to login...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-outfit">
            <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-xl shadow-blue-100 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-gray-900">Reset Password</h1>
                    <p className="text-gray-500 font-medium">Secure your account with a new password.</p>
                </div>

                {!token ? (
                    <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-bold text-center">
                        Invalid Link. Please request a new one.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-gray-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Confirm New Password</label>
                                <div className="relative group">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-12 pr-12 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-gray-300"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
                        >
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
