import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import { patientForgotPassword, doctorForgotPassword } from "@/infrastructure/api/auth.api"
import { toast } from "sonner"
import { ArrowLeft, Mail, CheckCircle2 } from "lucide-react"

export default function ForgotPassword() {
    const location = useLocation()
    const isDoctor = location.pathname.includes("doctor")
    const [email, setEmail] = useState("")
    const [loading, setLoading] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            if (isDoctor) {
                await doctorForgotPassword({ email })
            } else {
                await patientForgotPassword({ email })
            }
            setSubmitted(true)
            toast.success("Reset link sent!")
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send reset link")
        } finally {
            setLoading(false)
        }
    }

    if (submitted) {
        return (
            <div className="min-h-screen bg-gray-50/50 flex items-center justify-center p-6 font-outfit">
                <div className="w-full max-w-md bg-white rounded-[40px] p-10 md:p-12 shadow-[0_20px_60px_rgba(0,0,0,0.03)] border border-gray-100 text-center space-y-8">
                    <div className="mx-auto w-20 h-20 bg-primary-50 rounded-[28px] flex items-center justify-center shadow-sm">
                        <CheckCircle2 className="w-10 h-10 text-primary-600" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-[28px] font-black text-gray-900 tracking-tight leading-tight">Check your email</h1>
                        <p className="text-gray-400 font-bold leading-relaxed px-2">
                            If an account exists for <span className="text-gray-900 font-black">{email}</span>, 
                            we've sent instructions to reset your password.
                        </p>
                    </div>
                    <Link 
                        to={isDoctor ? "/doctor/login" : "/patient/login"}
                        className="inline-flex items-center gap-2 text-primary-600 font-black hover:text-primary-700 transition-colors uppercase tracking-widest text-[13px]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
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
                    <h1 className="text-[32px] font-black text-gray-900 tracking-tight leading-tight">Forgot Password?</h1>
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-[11px]">No worries, we'll send instructions.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8">
                    <div className="space-y-3">
                        <label className="text-[11px] font-black text-gray-400 uppercase tracking-widest ml-1">Identity Verification</label>
                        <div className="relative group">
                            <div className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-primary-600 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full pl-14 pr-6 py-5 bg-gray-50/50 border-2 border-gray-50 rounded-[24px] text-[15px] focus:bg-white focus:border-primary-600/20 focus:ring-8 focus:ring-primary-50/50 outline-none transition-all font-bold placeholder:text-gray-300"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                maxLength={30}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-primary-600 hover:bg-primary-700 text-white font-black h-16 rounded-[24px] transition-all shadow-xl shadow-primary-100 hover:shadow-primary-200 active:scale-95 disabled:opacity-50 text-[16px]"
                    >
                        {loading ? "Sending Protocol..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="text-center">
                    <Link 
                        to={isDoctor ? "/doctor/login" : "/patient/login"}
                        className="inline-flex items-center gap-2 text-primary-600 font-black hover:text-primary-700 transition-colors uppercase tracking-widest text-[13px]"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
