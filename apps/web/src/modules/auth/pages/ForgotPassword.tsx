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
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-outfit">
                <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-xl shadow-blue-100 text-center space-y-6">
                    <div className="mx-auto w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
                        <CheckCircle2 className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-gray-900">Check your email</h1>
                        <p className="text-gray-500 font-medium">
                            If an account exists for <span className="text-gray-900 font-bold">{email}</span>, 
                            we've sent instructions to reset your password.
                        </p>
                    </div>
                    <Link 
                        to={isDoctor ? "/doctor/login" : "/patient/login"}
                        className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 font-outfit">
            <div className="w-full max-w-md bg-white rounded-3xl p-10 shadow-xl shadow-blue-100 space-y-8">
                <div className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-gray-900">Forgot Password?</h1>
                    <p className="text-gray-500 font-medium">No worries, we'll send you reset instructions.</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors">
                                <Mail className="w-5 h-5" />
                            </div>
                            <input
                                type="email"
                                placeholder="name@example.com"
                                className="w-full pl-12 pr-4 py-4 bg-gray-50 border-none rounded-2xl text-sm focus:ring-2 focus:ring-blue-500/20 transition-all font-medium placeholder:text-gray-300"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all shadow-xl shadow-blue-200 active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Sending..." : "Send Reset Link"}
                    </button>
                </form>

                <div className="text-center">
                    <Link 
                        to={isDoctor ? "/doctor/login" : "/patient/login"}
                        className="inline-flex items-center gap-2 text-blue-600 font-bold hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
