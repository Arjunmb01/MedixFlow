import { useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { setupDoctorPassword as setupPassword } from "@/infrastructure/api/staff.api"

export default function SetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get("token")
    
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!token) {
            setError("Missing token")
            return
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match")
            return
        }
        if (password.length < 8) {
            setError("Password must be at least 8 characters")
            return
        }

        setLoading(true)
        setError("")
        try {
            await setupPassword({ token, password })
            setSuccess(true)
        } catch (err: any) {
            setError(err.response?.data?.error || "Failed to set password")
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 max-w-md w-full text-center">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Invalid Link</h2>
                    <p className="text-gray-500 mb-6">The password setup link is missing or invalid.</p>
                    <button 
                        onClick={() => navigate("/admin/login")}
                        className="w-full bg-teal-600 text-white py-3 rounded-xl font-bold hover:bg-teal-700 transition-all"
                    >
                        Go to Login
                    </button>
                </div>
            </div>
        )
    }

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-outfit">
                <div className="bg-white p-12 rounded-[2rem] shadow-2xl shadow-gray-200/50 max-w-md w-full text-center border border-gray-50">
                    <div className="w-12 h-12 bg-teal-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                        <span className="text-white font-bold text-xl">M</span>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Password Set!</h2>
                    <p className="text-gray-500 mb-8">Your account is now active. You can now login to your clinical workspace.</p>
                    <button 
                        onClick={() => navigate("/admin/login")}
                        className="w-full bg-teal-500 text-white py-4 rounded-xl font-bold hover:bg-teal-600 transition-all shadow-lg shadow-teal-500/20"
                    >
                        Redirect to Login
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 font-outfit">
            <div className="bg-white p-10 pb-12 rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.05)] max-w-md w-full border border-gray-50">
                <div className="flex flex-col items-center mb-8">
                    <div className="w-12 h-12 bg-[#10B981] rounded-xl flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                        <span className="text-white font-bold text-xl uppercase tracking-tighter">M</span>
                    </div>
                    <h1 className="text-2xl font-bold text-[#1E293B] mb-1">Set Password</h1>
                    <p className="text-[#64748B] text-sm">Access your clinical workspace</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 text-red-600 text-sm font-medium rounded-xl border border-red-100 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#475569] ml-1">New Password</label>
                        <input 
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-[#10B981] outline-none transition-all placeholder:text-[#94A3B8] font-medium text-[#1E293B]"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold text-[#475569] ml-1">Confirm Password</label>
                        <input 
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full px-5 py-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-[#10B981] outline-none transition-all placeholder:text-[#94A3B8] font-medium text-[#1E293B]"
                            required
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full bg-[#10B981] text-white py-4 rounded-2xl font-bold hover:bg-[#059669] transition-all shadow-xl shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 mt-4 h-14 flex items-center justify-center"
                    >
                        {loading ? "Processing..." : "Set Password"}
                    </button>
                    
                    <p className="text-center text-xs text-[#94A3B8] mt-6">
                        Securely managed by <strong>MedixFlow</strong> Security Protocol
                    </p>
                </form>
            </div>
        </div>
    )
}
