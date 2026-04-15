import { useState } from "react"
import { useSearchParams, useNavigate, useLocation, Link } from "react-router-dom"
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
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6 font-outfit">
                <div className="w-full max-w-md bg-white rounded-[40px] p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 text-center space-y-8">
                    <div className="mx-auto w-20 h-20 bg-primary-50 rounded-[28px] flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-10 h-10 text-primary-600" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Success!</h1>
                        <p className="text-gray-400 font-bold leading-relaxed px-2">
                            Your password has been reset successfully. Redirecting to your workspace...
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6 font-outfit">
            <div className="w-full max-w-md bg-white rounded-[40px] p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 space-y-10">
                <div className="flex justify-center mb-10">
                    <Link to="/">
                        <img src="/logo.png" alt="MedixFlow Logo" className="h-16 w-auto object-contain" />
                    </Link>
                </div>
                <div className="text-center space-y-3">
                    <h1 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">New Password</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">Secure your workspace with a strong key.</p>
                </div>

                {!token ? (
                    <div className="p-5 bg-red-50/50 border-2 border-red-50 rounded-[24px] text-red-600 text-sm font-black text-center uppercase tracking-widest">
                        Invalid Link Protocol
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">New Password</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-14 pr-14 py-5 bg-gray-50/50 border-2 border-gray-50 rounded-[24px] text-[15px] focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/50 outline-none transition-all font-bold placeholder:text-gray-300"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-primary-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Confirm Access Key</label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-600 transition-colors">
                                        <Lock className="w-5 h-5" />
                                    </div>
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="w-full pl-14 pr-14 py-5 bg-gray-50/50 border-2 border-gray-50 rounded-[24px] text-[15px] focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/50 outline-none transition-all font-bold placeholder:text-gray-300"
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
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black h-16 rounded-[24px] transition-all shadow-xl shadow-primary-100 hover:shadow-primary-200 active:scale-95 disabled:opacity-50 text-[16px]"
                        >
                            {loading ? "Updating Security..." : "Protocol Change"}
                        </button>
                    </form>
                )}
            </div>
        </div>
    )
}
